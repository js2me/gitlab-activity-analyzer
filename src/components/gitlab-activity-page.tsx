import ReactECharts from 'echarts-for-react';
import { withViewModel } from 'mobx-view-model';
import { GitLabActivityViewModel, type ProjectActivity } from '../model';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const GitLabActivityPage = withViewModel(
  GitLabActivityViewModel,
  ({ model }) => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-center font-bold text-4xl text-gray-800">
            Анализ активности GitLab
          </h1>

          {/* Сохраненные связки */}
          {model.savedConnections.length > 0 && (
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-xl">
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Сохраненные связки:
              </label>
              <div className="flex flex-wrap gap-2">
                {model.savedConnections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2"
                  >
                    <button
                      onClick={() => model.loadConnection(conn)}
                      className="font-medium text-indigo-700 text-sm hover:text-indigo-900"
                    >
                      {conn.label}
                    </button>
                    <button
                      onClick={() => model.deleteConnection(conn.id)}
                      className="text-red-500 text-sm hover:text-red-700"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Форма */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700 text-sm">
                  URL GitLab
                </label>
                <input
                  type="text"
                  value={model.gitlabUrl}
                  onChange={(e) => model.setGitlabUrl(e.target.value)}
                  placeholder="https://gitlab.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700 text-sm">
                  Access Token
                </label>
                <input
                  type="password"
                  value={model.accessToken}
                  onChange={(e) => model.setAccessToken(e.target.value)}
                  placeholder="Ваш токен доступа"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700 text-sm">
                  Дата от
                </label>
                <input
                  type="date"
                  value={model.dateFrom}
                  onChange={(e) => model.setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700 text-sm">
                  Дата до
                </label>
                <input
                  type="date"
                  value={model.dateTo}
                  onChange={(e) => model.setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => model.fetchActivity()}
                disabled={model.loading}
                className="rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {model.loading ? 'Загрузка...' : 'Запустить'}
              </button>
              {model.gitlabUrl && model.accessToken && (
                <button
                  onClick={() => {
                    const label = prompt(
                      'Введите название для сохранения связки:',
                      model.gitlabUrl,
                    );
                    if (label) {
                      model.saveConnection(label);
                    }
                  }}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-green-700 hover:shadow-xl"
                >
                  Сохранить связку
                </button>
              )}
            </div>

            {model.error && (
              <div className="mt-4 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
                {model.error}
              </div>
            )}
          </div>

          {/* Результаты */}
          {model.projects.length > 0 && (
            <div>
              {model.selectedProjectId === null ? (
                <>
                  <h2 className="mb-6 text-center font-bold text-2xl text-gray-800">
                    Активность по проектам ({model.projects.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {model.projects.map((project: ProjectActivity) => (
                      <div
                        key={project.projectId}
                        onClick={() => model.selectProject(project.projectId)}
                        className="cursor-pointer rounded-2xl border-2 border-transparent bg-white p-6 shadow-xl transition-all duration-200 hover:border-indigo-300 hover:shadow-2xl"
                      >
                        <ReactECharts
                          option={model.getPieChartOption(project)}
                          style={{ height: '400px', width: '100%' }}
                          opts={{ renderer: 'svg' }}
                        />
                        <div className="mt-4 text-center">
                          <p className="text-gray-600 text-sm">
                            Всего событий:{' '}
                            <span className="font-semibold">
                              {project.events.length}
                            </span>
                          </p>
                          <p className="mt-2 text-indigo-600 text-xs">
                            Нажмите для деталей
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-gray-800">
                      {model.selectedProject?.projectName}
                    </h2>
                    <button
                      onClick={() => model.deselectProject()}
                      className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    >
                      Назад к списку
                    </button>
                  </div>
                  <div className="rounded-2xl border-4 border-indigo-500 bg-white p-6 shadow-xl">
                    <ReactECharts
                      option={model.getPieChartOption(model.selectedProject!)}
                      style={{ height: '500px', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                    <div className="mt-4 text-center">
                      <p className="text-gray-600 text-sm">
                        Всего событий:{' '}
                        <span className="font-semibold">
                          {model.selectedProject?.events.length}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Список действий */}
                  {model.selectedProject &&
                    model.selectedProject.events.length > 0 && (
                      <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 font-bold text-gray-800 text-xl">
                          Все действия ({model.selectedProject.events.length})
                        </h3>
                        <div className="max-h-[600px] space-y-3 overflow-y-auto">
                          {model.selectedProject.events.map((event) => {
                            const eventUrl = model.getEventUrl(event);
                            const description =
                              model.getEventDescription(event);
                            const actionType = event.action_name.replace(
                              /_/g,
                              ' ',
                            );
                            const targetType = event.target_type || 'unknown';

                            return (
                              <div
                                key={event.id}
                                className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
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
                                        <span className="font-medium">
                                          Branch:
                                        </span>{' '}
                                        {event.push_data.ref}
                                      </p>
                                    )}
                                    {event.push_data?.commit_count !==
                                      undefined && (
                                      <p className="mb-1 text-gray-600 text-sm">
                                        <span className="font-medium">
                                          Commits:
                                        </span>{' '}
                                        {event.push_data.commit_count}
                                      </p>
                                    )}
                                    {event.target_title && (
                                      <p className="mb-1 break-words text-gray-600 text-sm">
                                        <span className="font-medium">
                                          Title:
                                        </span>{' '}
                                        {event.target_title}
                                      </p>
                                    )}
                                    {!event.target_title &&
                                      event.target?.title && (
                                        <p className="mb-1 break-words text-gray-600 text-sm">
                                          <span className="font-medium">
                                            Title:
                                          </span>{' '}
                                          {event.target.title}
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
                                    <span className="text-gray-400 text-xs">
                                      ID: {event.id}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {model.projects.length === 0 && !model.loading && !model.error && (
            <div className="mt-8 text-center text-gray-500">
              <p className="text-lg">
                Заполните форму и нажмите "Запустить" для анализа активности
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);
