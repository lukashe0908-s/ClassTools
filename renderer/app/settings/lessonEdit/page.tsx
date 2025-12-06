import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
export default function App() {
  return (
    <>
      <div className='ml-4 mb-4'>
        <span className='text-2xl font-bold [box-shadow:inset_0_-8px_#f73246] border-b-2 border-[#f73246]'>
          渲染序列
        </span>
      </div>
      <span className='ml-4'>近期课程管理可能重构为类似 Classland 的编辑方式</span>
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color='primary' />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>初始值</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>列表（名称）</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>列表（时间）</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>替换（天）</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>替换（课程）</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color='success' />
          </TimelineSeparator>
          <TimelineContent>完成</TimelineContent>
        </TimelineItem>
      </Timeline>
    </>
  );
}
