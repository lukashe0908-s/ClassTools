'use client';

import { useEffect, useState, useRef, useLayoutEffect, useReducer } from 'react';
import { Button, Modal, Skeleton } from '@heroui/react';
import {
  Cog6ToothIcon,
  ArrowPathIcon,
  XMarkIcon,
  LockClosedIcon,
  PowerIcon,
  PlayIcon,
  PauseIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import UpdateModal from './updateModal';
import ClassList from './classList';
import { Weather } from '@renderer/components/weather';
import { getConfigSync } from '@renderer/features/ipc/config';
import { generateConfig } from '@renderer/features/p_function';
import { reducer, initialState as reducerInitialState } from './reducer';
import { useWallpapersQuery } from '@renderer/features/background';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export default function HomePage() {
  useEffect(() => {
    const serviceWorkerScope = `/workbox-sw.js`;
    navigator.serviceWorker &&
      location.protocol === 'https:' &&
      navigator.serviceWorker
        .register(serviceWorkerScope)
        .then(() => {
          // console.info(`Service worker registered at ${serviceWorkerScope}`);
        })
        .catch(error => {
          console.error('Error in serviceWorker registration: ', error);
        });
  }, []);

  return (
    <>
      <title>Class Tools</title>
      <MainContent></MainContent>
      <UpdateModal></UpdateModal>
    </>
  );
}
function MainContent() {
  const [currentWallpaper, setCurrentWallpaper] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wallpaperListRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(1);
  const { wallpapers, wallpapersLoading } = useWallpapersQuery();

  useLayoutEffect(() => {
    const loadFontSize = async () => {
      const size = await getConfigSync('display.fontSize');
      setFontSize(Number(size) || 1);
    };
    loadFontSize();
    const handler = (name: string) => {
      if (name === 'display.fontSize') loadFontSize();
    };

    window.ipc?.on('sync-config', handler);
    return () => {
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, []);
  useLayoutEffect(() => {
    const savedIndex = localStorage.getItem('default_wallpaper_select');
    if (savedIndex) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);
  const updateWallpaper = (newWallpaper: string | null | undefined, index: number) => {
    localStorage.setItem('default_wallpaper_select', index.toString());
    setSelectedIndex(index);
    setCurrentWallpaper(newWallpaper ?? null);

    // Use requestAnimationFrame to scroll after DOM update.
    requestAnimationFrame(() => {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[index] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  };

  useEffect(() => {
    if (wallpapersLoading || wallpapers.length === 0) {
      setCurrentWallpaper(null);
      return;
    }

    const savedIndex = parseInt(localStorage.getItem('default_wallpaper_select') || '0', 10);
    const validIndex =
      Number.isFinite(savedIndex) && savedIndex >= 0 && savedIndex < wallpapers.length ? savedIndex : 0;
    updateWallpaper(wallpapers[validIndex].image_url, validIndex);
  }, [wallpapers]);

  // Scroll to selected wallpaper after list is rendered.
  useEffect(() => {
    if (wallpapers.length > 0) {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[selectedIndex] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }
    }
  }, [wallpapers]);

  const [state, dispatch] = useReducer(reducer, reducerInitialState);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await generateConfig();

      const display = {
        slidingPosition: ((await getConfigSync('display.slidingPosition')) as any) ?? 'start',
        timeDisplay: ((await getConfigSync('display.timeDisplay')) as any) ?? 'always',
        progressDisplay: ((await getConfigSync('display.progressDisplay')) as any) ?? 'active',
        hiddenControlBar: ((await getConfigSync('display.hidden.controlBar')) as any) ?? false,
        hiddenRefreshWindow: ((await getConfigSync('display.hidden.refreshWindow')) as any) ?? false,
        useWindowBackgroundMaterial: ((await getConfigSync('display.useWindowBackgroundMaterial')) as any) ?? false,
      };

      dispatch({
        type: 'UPDATE',
        payload: {
          classSchedule: config,
          display,
        },
      });
    };

    loadConfig();

    const handler = (name: string) => {
      if (name.startsWith('display.') || name.startsWith('lessonsList.')) {
        loadConfig();
      }
    };

    window.ipc?.on('sync-config', handler);
    return () => {
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, []);

  return (
    <div
      className={`flex flex-col gap-0 p-0 h-full transition-background ${
        (currentWallpaper && !state.display.useWindowBackgroundMaterial) || state.display.useWindowBackgroundMaterial
          ? ''
          : 'bg-background'
      }`}
      style={{
        fontSize: fontSize + 'em',
      }}>
      {/* Toolbar */}
      <div className={`flex gap-2 items-center bg-white/40 dark:bg-black/20 h-6`}>
        <Button
          isIconOnly
          variant='ghost'
          onPress={() => {
            window.ipc?.send('resize-window');
          }}
          className='h-6 w-6 flex items-center justify-center rounded-none hover:bg-black/10  hover:dark:bg-white/10'>
          <ArrowUturnLeftIcon className='w-4 h-4 text-neutral-900 dark:text-neutral-100'></ArrowUturnLeftIcon>
        </Button>
        <span className={`text-sm w-full select-none ${state.display.hiddenControlBar || '[app-region:drag]'}`}>
          Class Tools
        </span>
      </div>

      {/* Main Content */}
      <div className='flex flex-col gap-2 py-2 grow overflow-y-auto [scrollbar-width:none]'>
        <ClassList
          schedule={state.classSchedule}
          slidingPosition={state.display.slidingPosition}
          timeDisplay={state.display.timeDisplay}
          progressDisplay={state.display.progressDisplay}></ClassList>
        {/* Background Picture List */}
        <div className='w-full flex justify-center px-2'>
          <OverlayScrollbarsComponent
            className='max-h-[40vh] aspect-video rounded-lg'
            options={{
              scrollbars: {
                autoHide: 'move',
              },
            }}>
            <div ref={wallpaperListRef} className='flex flex-col gap-4 shadow-md snap-y snap-proximity'>
              {wallpapersLoading ? (
                <div className='w-screen grow max-w-full snap-center object-contain'>
                  <Skeleton className='w-full aspect-video rounded-lg'></Skeleton>
                </div>
              ) : (
                wallpapers.map((wallpaper, index) => {
                  const { type, image_url, video_url } = wallpaper;
                  const key = `wallpaper-${index}`;
                  const handleClick = () => updateWallpaper(image_url, index);

                  return (
                    <div
                      key={key}
                      className='relative w-full aspect-video rounded-lg snap-center object-contain'
                      onClick={handleClick}>
                      {type === 'mixed' ? (
                        <>
                          {state.playingMixed ? (
                            <video
                              src={video_url}
                              className='w-full h-full rounded-lg object-contain'
                              muted
                              loop
                              autoPlay
                              playsInline
                            />
                          ) : (
                            <img
                              src={image_url}
                              className='w-full h-full rounded-lg object-contain'
                              referrerPolicy='no-referrer'
                            />
                          )}
                          <button
                            onClick={() => {
                              dispatch({
                                type: 'SET_PLAYING_MIXED',
                                payload: !state.playingMixed,
                              });
                            }}
                            className='z-20 absolute bottom-1 left-1 bg-black/30 text-white/60 text-sm p-1 rounded-full hover:bg-black/40 hover:text-white/80 transition-colors'>
                            {state.playingMixed ? (
                              <PauseIcon className='w-4 h-4'></PauseIcon>
                            ) : (
                              <PlayIcon className='w-4 h-4'></PlayIcon>
                            )}
                          </button>
                        </>
                      ) : type === 'video' ? (
                        <video
                          key={key}
                          src={video_url}
                          className='w-full aspect-video rounded-lg snap-center select-none object-contain'
                          onClick={handleClick}
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          key={key}
                          src={image_url || null}
                          className='w-full aspect-video rounded-lg snap-center select-none object-contain'
                          onClick={handleClick}
                          referrerPolicy='no-referrer'
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>

      {/* Footer */}
      <div className='flex gap-1 items-center bg-white/40 dark:bg-black/20 p-1 rounded-t-xl  shrink-0 overflow-x-auto'>
        <Button
          variant='tertiary'
          className='rounded-2xl'
          isIconOnly
          onPress={() => {
            if (window.ipc) {
              window.ipc?.send('settings-window');
            } else {
              window.location.href = '/settings';
            }
          }}
          aria-label='Settings'>
          <Cog6ToothIcon className='w-5 h-5'></Cog6ToothIcon>
        </Button>
        {!state.display.hiddenRefreshWindow && (
          <Button
            variant='tertiary'
            className='rounded-2xl'
            isIconOnly
            onPress={() => {
              window.location.reload();
            }}
            aria-label='Refresh'>
            <ArrowPathIcon className='w-5 h-5'></ArrowPathIcon>
          </Button>
        )}
        <div className='flex-1'></div>
        <Modal>
          <Button variant='tertiary' className='rounded-2xl' isIconOnly={true}>
            <PowerIcon className='w-5 h-5'></PowerIcon>
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement='bottom'>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>电源操作</Modal.Heading>
                </Modal.Header>
                <Modal.Footer className='flex-col'>
                  <div className='flex w-full gap-2'>
                    <Button
                      variant='danger'
                      className='min-w-1'
                      fullWidth={true}
                      slot='close'
                      onPress={() => {
                        window.ipc?.send('sys-shutdown', 'shutdown');
                      }}>
                      <PowerIcon className='w-5 h-5'></PowerIcon>关机
                    </Button>
                    <Button
                      variant='secondary'
                      className='min-w-1'
                      fullWidth={true}
                      slot='close'
                      onPress={() => {
                        window.ipc?.send('sys-shutdown', 'restart');
                      }}>
                      <ArrowPathIcon className='w-5 h-5'></ArrowPathIcon>重启
                    </Button>
                    <Button
                      className='min-w-1'
                      fullWidth={true}
                      slot='close'
                      onPress={() => {
                        window.ipc?.send('sys-shutdown', 'lock');
                      }}>
                      <LockClosedIcon className='w-5 h-5'></LockClosedIcon>锁定
                    </Button>
                  </div>
                  <Button variant='outline' className='min-w-1' fullWidth={true} slot='close'>
                    <XMarkIcon className='w-5 h-5'></XMarkIcon>取消
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
        <Weather />
      </div>
      {/* Background */}
      <div
        className={
          'absolute top-0 z-[-1] w-full h-full ' + (state.display.useWindowBackgroundMaterial ? 'hidden' : '')
        }>
        <img
          className={`object-cover select-none w-full h-full svg-blur-filter dark:opacity-90`}
          referrerPolicy='no-referrer'
          draggable='false'
          src={currentWallpaper || null}
        />
      </div>
    </div>
  );
}
