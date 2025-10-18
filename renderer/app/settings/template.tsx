'use client';
import { Divider } from '@heroui/react';
import { Navigation, NavigationSub, NavigationItem } from '../../components/navigation';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export default function Template({ children }) {
  return (
    <>
      <title>Settings - Class Tools</title>
      <div className='flex h-full select-auto bg-gray-50/30'>
        <div className='h-full flex select-none'>
          <OverlayScrollbarsComponent
            defer
            className='overflow-auto scrollbar-hide border-r border-gray-200/60 min-w-50 bg-white/50'
            options={{ scrollbars: { autoHide: 'move' } }}>
            <div className='p-2'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <SettingsOutlinedIcon className='text-gray-900 text-xl' />
                <span className='font-bold text-2xl text-gray-900'>设置</span>
              </div>
              <Divider className='mb-2'></Divider>
              <Navigation>
                <div className='mb-3'>
                  <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3'>课程管理</div>
                  <NavigationItem link={'/settings/lessonEdit'}>
                    <EditOutlinedIcon className='pr-2 text-gray-600'></EditOutlinedIcon>课表编辑
                  </NavigationItem>
                  <NavigationSub>
                    <NavigationItem link={'/settings/lessonEdit/default'}>
                      <AssessmentOutlinedIcon className='pr-2 text-gray-500'></AssessmentOutlinedIcon>基本配置
                    </NavigationItem>
                    <NavigationItem link={'/settings/lessonEdit/name'}>
                      <FormatColorTextOutlinedIcon className='pr-2 text-gray-500'></FormatColorTextOutlinedIcon>名称
                    </NavigationItem>
                    <NavigationItem link={'/settings/lessonEdit/time'}>
                      <AccessTimeOutlinedIcon className='pr-2 text-gray-500'></AccessTimeOutlinedIcon>时间
                    </NavigationItem>
                    <NavigationItem link={'/settings/lessonEdit/changeDay'}>
                      <DateRangeOutlinedIcon className='pr-2 text-gray-500'></DateRangeOutlinedIcon>换课 (天)
                    </NavigationItem>
                    <NavigationItem link={'/settings/lessonEdit/change'}>
                      <DateRangeOutlinedIcon className='pr-2 text-gray-500'></DateRangeOutlinedIcon>换课
                    </NavigationItem>
                  </NavigationSub>
                </div>

                <div className='mb-3'>
                  <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3'>应用</div>
                  <NavigationItem link={'/settings/display'}>
                    <SettingsOutlinedIcon className='pr-2 text-gray-600'></SettingsOutlinedIcon>常规
                  </NavigationItem>
                  <NavigationItem link={'/settings/privacy'}>
                    <ShieldOutlinedIcon className='pr-2 text-gray-600'></ShieldOutlinedIcon>隐私与数据
                  </NavigationItem>
                </div>

                <div className='mb-3'>
                  <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3'>
                    开发者选项
                  </div>
                  <NavigationItem link={'/settings/debug'}>
                    <BugReportOutlinedIcon className='pr-2 text-gray-600'></BugReportOutlinedIcon>调试
                  </NavigationItem>
                  <NavigationSub>
                    <NavigationItem link={'/settings/debug/labs'}>
                      <ScienceOutlinedIcon className='pr-2 text-gray-500'></ScienceOutlinedIcon>实验室
                    </NavigationItem>
                  </NavigationSub>
                </div>

                <div>
                  <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3'>信息</div>
                  <NavigationItem link={'/settings/about'}>
                    <InfoOutlinedIcon className='pr-2 text-gray-600'></InfoOutlinedIcon>关于
                  </NavigationItem>
                </div>
              </Navigation>
            </div>
          </OverlayScrollbarsComponent>
        </div>

        <OverlayScrollbarsComponent
          defer
          className='h-full w-full p-2 scrollbar-hide bg-gray-50/50'
          options={{ scrollbars: { autoHide: 'move' } }}>
          {children}
        </OverlayScrollbarsComponent>
      </div>
    </>
  );
}
