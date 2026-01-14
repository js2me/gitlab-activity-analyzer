import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import { cx } from 'yummies/css';
import { formatDate } from '../lib/date';
import type { GitLabActivityPageVM } from '../model';
import type { GitLabEvent } from '../model/types';

export const GitlabEventCard = observer(
  ({ event, className }: { event: GitLabEvent; className?: string }) => {
    const model = useViewModel<GitLabActivityPageVM>();

    const eventUrl = model.getEventUrl(event);
    const description = model.getEventDescription(event);
    const actionType = event.action_name.replace(/_/g, ' ');
    const targetType = event.target_type || 'unknown';

    return (
      <div
        className={cx(
          'rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start gap-2">
              <span className="inline-flex items-center whitespace-nowrap rounded bg-indigo-100 px-2 py-1 font-medium text-indigo-800 text-xs">
                {actionType}
              </span>
              {event.target_type && (
                <span className="inline-flex items-center whitespace-nowrap rounded bg-gray-100 px-2 py-1 font-medium text-gray-800 text-xs">
                  {targetType}
                </span>
              )}
            </div>
            <p className="mb-1 break-words font-semibold text-gray-800">
              {description}
            </p>
            {event.push_data?.ref && (
              <p className="mb-1 text-gray-600 text-sm">
                <span className="font-medium">Branch:</span>{' '}
                {event.push_data.ref}
              </p>
            )}
            {event.push_data?.commit_count !== undefined && (
              <p className="mb-1 text-gray-600 text-sm">
                <span className="font-medium">Commits:</span>{' '}
                {event.push_data.commit_count}
              </p>
            )}
            {event.target_title && (
              <p className="mb-1 break-words text-gray-600 text-sm">
                <span className="font-medium">Title:</span> {event.target_title}
              </p>
            )}
            {!event.target_title && event.target?.title && (
              <p className="mb-1 break-words text-gray-600 text-sm">
                <span className="font-medium">Title:</span> {event.target.title}
              </p>
            )}
            <p className="mt-2 text-gray-500 text-sm">
              {formatDate(event.created_at)}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            {eventUrl && (
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1 text-white text-xs transition-colors hover:bg-indigo-700"
              >
                Открыть →
              </a>
            )}
            <span className="text-gray-400 text-xs">ID: {event.id}</span>
          </div>
        </div>
      </div>
    );
  },
);
