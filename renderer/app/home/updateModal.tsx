'use client';

import { useEffect, useRef, useState } from 'react';
import { toast, Button, Modal, ProgressBar } from '@heroui/react';
import { getConfigSync } from '@renderer/features/ipc/config';

type UpdateFile = {
  url: string;
  size: number;
  sha512: string;
};

type UpdateInfo = {
  version: string;
  files: UpdateFile[];
};

type DownloadProgress = {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
};

type DownloadState = {
  progress: number;
  totalSize: number;
  downloadedSize: number;
  speed: number;
  isDownloading: boolean;
};

const INITIAL_DOWNLOAD_STATE: DownloadState = {
  progress: 0,
  totalSize: 0,
  downloadedSize: 0,
  speed: 0,
  isDownloading: false,
};

export default function UpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [autoDownloadUpdate, setAutoDownloadUpdate] = useState(true);
  const [downloadState, setDownloadState] = useState<DownloadState>(INITIAL_DOWNLOAD_STATE);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateDownloadedModalOpen, setIsUpdateDownloadedModalOpen] = useState(false);
  const autoDownloadRef = useRef(autoDownloadUpdate);

  useEffect(() => {
    autoDownloadRef.current = autoDownloadUpdate;
  }, [autoDownloadUpdate]);

  useEffect(() => {
    const loadAutoDownloadSetting = async () => {
      const data = await getConfigSync('upgrade.autoDownloadUpdate');
      setAutoDownloadUpdate(typeof data === 'boolean' ? data : true);
    };

    const handleSyncConfig = (name: string) => {
      if (name === 'upgrade.autoDownloadUpdate') {
        void loadAutoDownloadSetting();
      }
    };

    void loadAutoDownloadSetting();
    window.ipc?.on('sync-config', handleSyncConfig);

    return () => {
      window.ipc?.removeListener?.('sync-config', handleSyncConfig);
    };
  }, []);

  useEffect(() => {
    const handleUpdateAvailable = (info: UpdateInfo) => {
      setUpdateInfo(info);
      setDownloadState(INITIAL_DOWNLOAD_STATE);

      if (autoDownloadRef.current) {
        setDownloadState(prev => ({ ...prev, isDownloading: true }));
        toast('', {
          description: `发现新版本 ${info.version}，正在后台下载`,
        });
        return;
      }

      setIsUpdateModalOpen(true);
    };

    const handleDownloadProgress = (data: DownloadProgress) => {
      setDownloadState({
        progress: data.percent,
        totalSize: data.total,
        downloadedSize: data.transferred,
        speed: data.bytesPerSecond,
        isDownloading: true,
      });
    };

    const handleUpdateDownloaded = () => {
      if (autoDownloadRef.current) {
        toast('', {
          description: '更新下载完成，可重启安装',
        });
      } else {
        setIsUpdateDownloadedModalOpen(true);
      }
      setDownloadState(INITIAL_DOWNLOAD_STATE);
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

  const handleManualDownload = () => {
    setDownloadState(prev => ({ ...prev, isDownloading: true }));
    window.ipc?.send('autoUpdater/downloadUpdate');
  };

  return (
    <>
      <Modal isOpen={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <Modal.Backdrop variant='blur'>
          <Modal.Container size='sm'>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>发现新版本</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>
                  检测到新版本 <strong>{updateInfo?.version}</strong> 可用。
                </p>
                <p>{`是否立即下载并更新？ (${formatSize(updateInfo?.files?.[0]?.size || 0)})`}</p>

                {downloadState.isDownloading && (
                  <div className='mt-4 space-y-1'>
                    <ProgressBar aria-label='下载进度' value={downloadState.progress}>
                      <ProgressBar.Track>
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                    <p className='text-sm'>
                      {`${downloadState.progress.toFixed(1)}%  ${formatSpeed(downloadState.speed)}  已下载 ${formatSize(
                        downloadState.downloadedSize,
                      )} / ${formatSize(downloadState.totalSize)}`}
                    </p>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant='secondary'
                  onPress={() => setIsUpdateModalOpen(false)}
                  isDisabled={downloadState.isDownloading}
                  fullWidth>
                  稍后
                </Button>
                <Button onPress={handleManualDownload} isDisabled={downloadState.isDownloading} fullWidth>
                  立即更新
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={isUpdateDownloadedModalOpen} onOpenChange={setIsUpdateDownloadedModalOpen}>
        <Modal.Backdrop variant='blur'>
          <Modal.Container size='sm'>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>更新已准备就绪</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>新版本已成功下载，是否重启并安装？</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant='secondary' onPress={() => setIsUpdateDownloadedModalOpen(false)} fullWidth>
                  稍后
                </Button>
                <Button
                  onPress={() => {
                    window.ipc?.send('autoUpdater/quitAndInstall');
                    setIsUpdateDownloadedModalOpen(false);
                  }}
                  fullWidth>
                  重启应用
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond > 1024 * 1024) {
    return (bytesPerSecond / (1024 * 1024)).toFixed(2) + ' MB/s';
  }

  if (bytesPerSecond > 1024) {
    return (bytesPerSecond / 1024).toFixed(1) + ' KB/s';
  }

  return bytesPerSecond + ' B/s';
}

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  if (bytes > 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return bytes + ' B';
}
