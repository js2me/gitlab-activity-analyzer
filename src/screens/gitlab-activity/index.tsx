import ReactECharts from 'echarts-for-react';
import { withViewModel } from 'mobx-view-model';
import { VList } from 'virtua';
import { cx } from 'yummies/css';
import { FiltersCard } from './components/filters-card';
import { GitlabEventCard } from './components/gitlab-event-card';
import { GitLabActivityPageVM, type ProjectActivity } from './model';

export const GitlabActivityPage = withViewModel(
  GitLabActivityPageVM,
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

          <FiltersCard />

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
                      <div className="mt-6 flex flex-col rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 font-bold text-gray-800 text-xl">
                          Все действия ({model.selectedProject.events.length})
                        </h3>
                        <VList
                          data={model.selectedProject.events}
                          className="min-h-[600px] flex-1"
                        >
                          {(event, i) => (
                            <GitlabEventCard
                              event={event}
                              key={event.id}
                              className={cx({
                                'mt-4': i > 0,
                              })}
                            />
                          )}
                        </VList>
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
