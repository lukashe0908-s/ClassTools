'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Progress, useDisclosure } from '@heroui/react';

export default function UpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<{ version: string; files: [{ url; size; sha512 }] } | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [downloadTotalSize, setDownloadTotalSize] = useState<number>(0);
  const [downloadSize, setDownloadSize] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const { isOpen: isUpdateModalOpen, onOpen: openUpdateModal, onOpenChange: onUpdateModalChange } = useDisclosure();

  const {
    isOpen: isUpdateDownloadedModalOpen,
    onOpen: openUpdateDownloadedModal,
    onOpenChange: onUpdateDownloadedModalChange,
  } = useDisclosure();

  useEffect(() => {
    const handleUpdateAvailable = (info: { version: string; files: [{ url; size; sha512 }] }) => {
      setUpdateInfo(info);
      openUpdateModal();
    };

    const handleDownloadProgress = (data: { percent: number; bytesPerSecond: number; total: number; transferred: number }) => {
      setProgress(data.percent);
      setDownloadTotalSize(data.total);
      setDownloadSize(data.transferred);
      setDownloadSpeed(data.bytesPerSecond);
    };

    const handleUpdateDownloaded = () => {
      openUpdateDownloadedModal();
      setIsDownloading(false);
      setProgress(0);
    };

    window.ipc?.on('autoUpdater/update-available', handleUpdateAvailable);
    window.ipc?.on('autoUpdater/download-progress', handleDownloadProgress);
    window.ipc?.on('autoUpdater/update-downloaded', handleUpdateDownloaded);

    return () => {
      window.ipc?.removeListener?.('autoUpdater/update-available', handleUpdateAvailable);
      window.ipc?.removeListener?.('autoUpdater/download-progress', handleDownloadProgress);
      window.ipc?.removeListener?.('autoUpdater/update-downloaded', handleUpdateDownloaded);
    };
  }, []);

  return (
    <>
      {/* 更新可用提示 */}
      <Modal isOpen={isUpdateModalOpen} onOpenChange={onUpdateModalChange} backdrop='blur'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>发现新版本</ModalHeader>
              <ModalBody>
                <p>
                  检测到新版本 <strong>{updateInfo?.version}</strong> 可用。
                </p>
                <p>{`是否立即下载并更新？ (${formatSize(updateInfo?.files?.[0]?.size || 0)})`}</p>

                {isDownloading && (
                  <div className='mt-4'>
                    <Progress aria-label='下载进度' value={progress} color='primary' showValueLabel className='w-full' />
                    <p className='text-sm text-gray-500 mt-1'>
                      {`${progress.toFixed(1)}% ${formatSpeed(downloadSpeed)} \n已下载 ${formatSize(downloadSize)} / ${formatSize(
                        downloadTotalSize
                      )}`}
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='default' onPress={onClose} isDisabled={isDownloading} fullWidth>
                  稍后
                </Button>
                <Button
                  color='primary'
                  onPress={() => {
                    window.ipc?.send('autoUpdater/downloadUpdate');
                    setIsDownloading(true);
                  }}
                  isDisabled={isDownloading}
                  fullWidth>
                  立即更新
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 下载完成提示 */}
      <Modal isOpen={isUpdateDownloadedModalOpen} onOpenChange={onUpdateDownloadedModalChange} backdrop='blur'>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>更新已准备就绪</ModalHeader>
              <ModalBody>
                <p>新版本已成功下载，是否现在重启并安装更新？</p>
              </ModalBody>
              <ModalFooter>
                <Button color='default' onPress={onClose} fullWidth>
                  稍后
                </Button>
                <Button
                  color='success'
                  onPress={() => {
                    window.ipc?.send('autoUpdater/quitAndInstall');
                    onClose();
                  }}
                  fullWidth>
                  重启并更新
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond > 1024 * 1024) {
    return (bytesPerSecond / (1024 * 1024)).toFixed(2) + ' MB/s';
  } else if (bytesPerSecond > 1024) {
    return (bytesPerSecond / 1024).toFixed(1) + ' KB/s';
  } else {
    return bytesPerSecond + ' B/s';
  }
}
function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  } else if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (bytes > 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return bytes + ' B';
  }
}
