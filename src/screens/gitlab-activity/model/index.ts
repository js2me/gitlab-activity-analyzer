import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { ViewModelBase } from 'mobx-view-model';
import type { GitLabEvent, SavedConnection } from './types';
import type { ProjectActivity } from './types';

export type { ProjectActivity };

export class GitLabActivityPageVM extends ViewModelBase {
  gitlabUrl = '';
  accessToken = '';
  dateFrom = '';
  dateTo = '';
  loading = false;
  error: string | null = null;
  projects: ProjectActivity[] = [];
  selectedProjectId: number | null = null;
  savedConnections: SavedConnection[] = [];

  willMount(): void {
    makeObservable(this, {
      gitlabUrl: observable,
      accessToken: observable,
      dateFrom: observable,
      dateTo: observable,
      loading: observable,
      error: observable,
      projects: observable,
      selectedProjectId: observable,
      savedConnections: observable,
      setGitlabUrl: action,
      setAccessToken: action,
      setDateFrom: action,
      setDateTo: action,
      fetchActivity: action,
      selectProject: action,
      deselectProject: action,
      saveConnection: action,
      loadConnection: action,
      deleteConnection: action,
      groupedProjects: computed,
      selectedProject: computed,
    });

    // Загружаем данные из sessionStorage при инициализации
    this.loadFromSession();
  }

  setGitlabUrl(url: string) {
    this.gitlabUrl = url;
    this.saveToSession();
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.saveToSession();
  }

  setDateFrom(date: string) {
    this.dateFrom = date;
    this.saveToSession();
  }

  setDateTo(date: string) {
    this.dateTo = date;
    this.saveToSession();
  }

  selectProject(projectId: number) {
    this.selectedProjectId = projectId;
  }

  deselectProject() {
    this.selectedProjectId = null;
  }

  saveConnection(label: string) {
    if (!this.gitlabUrl || !this.accessToken) {
      return;
    }

    const connection: SavedConnection = {
      id: Date.now().toString(),
      url: this.gitlabUrl,
      token: this.accessToken,
      label: label || this.gitlabUrl,
    };

    this.savedConnections.push(connection);
    this.saveConnectionsToSession();
  }

  loadConnection(connection: SavedConnection) {
    this.gitlabUrl = connection.url;
    this.accessToken = connection.token;
    this.saveToSession();
  }

  deleteConnection(connectionId: string) {
    this.savedConnections = this.savedConnections.filter(
      (conn) => conn.id !== connectionId,
    );
    this.saveConnectionsToSession();
  }

  private saveToSession() {
    try {
      sessionStorage.setItem('gitlab_url', this.gitlabUrl);
      sessionStorage.setItem('gitlab_token', this.accessToken);
      sessionStorage.setItem('date_from', this.dateFrom);
      sessionStorage.setItem('date_to', this.dateTo);
    } catch (err) {
      console.error('Ошибка сохранения в sessionStorage:', err);
    }
  }

  private loadFromSession() {
    try {
      const url = sessionStorage.getItem('gitlab_url');
      const token = sessionStorage.getItem('gitlab_token');
      const dateFrom = sessionStorage.getItem('date_from');
      const dateTo = sessionStorage.getItem('date_to');

      if (url) this.gitlabUrl = url;
      if (token) this.accessToken = token;
      if (dateFrom) this.dateFrom = dateFrom;
      if (dateTo) this.dateTo = dateTo;

      // Загружаем сохраненные связки
      const connectionsJson = sessionStorage.getItem('saved_connections');
      if (connectionsJson) {
        this.savedConnections = JSON.parse(connectionsJson);
      }
    } catch (err) {
      console.error('Ошибка загрузки из sessionStorage:', err);
    }
  }

  private saveConnectionsToSession() {
    try {
      sessionStorage.setItem(
        'saved_connections',
        JSON.stringify(this.savedConnections),
      );
    } catch (err) {
      console.error('Ошибка сохранения связок в sessionStorage:', err);
    }
  }

  async fetchActivity() {
    if (
      !this.gitlabUrl ||
      !this.accessToken ||
      !this.dateFrom ||
      !this.dateTo
    ) {
      this.error = 'Заполните все поля';
      return;
    }

    this.loading = true;
    this.error = null;
    this.projects = [];

    try {
      // Нормализуем URL GitLab
      const baseUrl = this.gitlabUrl.replace(/\/$/, '');
      const apiUrl = `${baseUrl}/api/v4`;

      // Получаем текущего пользователя
      const userResponse = await fetch(`${apiUrl}/user`, {
        headers: {
          'PRIVATE-TOKEN': this.accessToken,
        },
      });

      if (!userResponse.ok) {
        throw new Error(
          'Не удалось получить данные пользователя. Проверьте токен доступа.',
        );
      }

      const currentUser = await userResponse.json();

      // Получаем события пользователя за период используя endpoint для конкретного пользователя
      const eventsUrl = `${apiUrl}/users/${currentUser.id}/events?after=${this.dateFrom}&before=${this.dateTo}&per_page=100`;
      const events: GitLabEvent[] = [];

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${eventsUrl}&page=${page}`, {
          headers: {
            'PRIVATE-TOKEN': this.accessToken,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Ошибка при получении событий: ${response.statusText}`,
          );
        }

        const pageEvents: GitLabEvent[] = await response.json();

        // Все события уже принадлежат текущему пользователю, фильтрация не нужна
        events.push(...pageEvents);

        // Проверяем заголовки пагинации для определения наличия следующей страницы
        const totalPages = response.headers.get('x-total-pages');
        const currentPage = response.headers.get('x-page');

        if (totalPages && currentPage) {
          hasMore = parseInt(currentPage) < parseInt(totalPages);
        } else {
          // Fallback: если заголовков нет, проверяем по количеству событий
          hasMore = pageEvents.length === 100;
        }

        page++;
      }

      // Группируем события по проектам
      const projectMap = new Map<number, ProjectActivity>();

      for (const event of events) {
        if (!projectMap.has(event.project_id)) {
          // Получаем информацию о проекте
          const projectResponse = await fetch(
            `${apiUrl}/projects/${event.project_id}`,
            {
              headers: {
                'PRIVATE-TOKEN': this.accessToken,
              },
            },
          );

          const project = projectResponse.ok
            ? await projectResponse.json()
            : null;
          const projectName = project?.name || `Project ${event.project_id}`;
          const projectPath =
            project?.path_with_namespace ||
            project?.id?.toString() ||
            event.project_id.toString();

          projectMap.set(event.project_id, {
            projectId: event.project_id,
            projectName,
            projectPath,
            events: [],
            activityTypes: {},
          });
        }

        const projectActivity = projectMap.get(event.project_id)!;
        projectActivity.events.push(event);

        // Подсчитываем типы активности
        const activityKey = `${event.action_name}_${event.target_type}`;
        projectActivity.activityTypes[activityKey] =
          (projectActivity.activityTypes[activityKey] || 0) + 1;
      }

      const projects = Array.from(projectMap.values());

      projects.forEach((project) => {
        project.events.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      });

      runInAction(() => {
        this.projects = projects;
      });
    } catch (err) {
      runInAction(() => {
        this.error =
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при загрузке данных';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  get groupedProjects() {
    return this.projects;
  }

  get selectedProject() {
    if (this.selectedProjectId === null) {
      return null;
    }
    return (
      this.projects.find((p) => p.projectId === this.selectedProjectId) || null
    );
  }

  getEventUrl(event: GitLabEvent): string | null {
    if (!this.gitlabUrl || !event.project_id) {
      return null;
    }

    const baseUrl = this.gitlabUrl.replace(/\/$/, '');
    const project = this.projects.find((p) => p.projectId === event.project_id);
    const projectPath = project?.projectPath || event.project_id.toString();

    // Для push событий - ссылка на коммит
    if (event.action_name === 'pushed' && event.push_data?.commit_to) {
      return `${baseUrl}/${projectPath}/-/commit/${event.push_data.commit_to}`;
    }

    // Для push событий - ссылка на ветку, если нет коммита
    if (event.action_name === 'pushed' && event.push_data?.ref) {
      return `${baseUrl}/${projectPath}/-/tree/${event.push_data.ref}`;
    }

    // Для merge request событий - используем target_iid вместо target_id
    if (event.target_type === 'MergeRequest' && event.target_iid) {
      return `${baseUrl}/${projectPath}/-/merge_requests/${event.target_iid}`;
    }

    // Для issue событий - используем target_iid вместо target_id
    if (event.target_type === 'Issue' && event.target_iid) {
      return `${baseUrl}/${projectPath}/-/issues/${event.target_iid}`;
    }

    // Для note событий (комментарии)
    if (event.action_name === 'commented' && event.target_iid) {
      if (event.target_type === 'MergeRequest') {
        return `${baseUrl}/${projectPath}/-/merge_requests/${event.target_iid}`;
      }
      if (event.target_type === 'Issue') {
        return `${baseUrl}/${projectPath}/-/issues/${event.target_iid}`;
      }
    }

    return null;
  }

  getEventDescription(event: GitLabEvent): string {
    const actionName = event.action_name.replace(/_/g, ' ');

    // Для push событий
    if (event.action_name === 'pushed' && event.push_data) {
      const ref = event.push_data.ref || event.push_data.ref_type || 'branch';
      const commitCount = event.push_data.commit_count || 0;
      const commitTitle = event.push_data.commit_title;

      if (commitTitle) {
        return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${ref}: ${commitTitle}`;
      }
      return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${ref}`;
    }

    // Для merge request событий - используем target_title
    if (event.target_type === 'MergeRequest' && event.target_title) {
      return `${actionName}: ${event.target_title}`;
    }

    // Для issue событий - используем target_title
    if (event.target_type === 'Issue' && event.target_title) {
      return `${actionName}: ${event.target_title}`;
    }

    // Fallback на target.title если target_title нет
    if (event.target_type === 'MergeRequest' && event.target?.title) {
      return `${actionName}: ${event.target.title}`;
    }

    if (event.target_type === 'Issue' && event.target?.title) {
      return `${actionName}: ${event.target.title}`;
    }

    // Для комментариев
    if (event.action_name === 'commented' && event.note?.body) {
      const notePreview = event.note.body.substring(0, 100);
      return `Commented: ${notePreview}${event.note.body.length > 100 ? '...' : ''}`;
    }

    // Для других типов
    if (event.target_type) {
      return `${actionName} ${event.target_type}`;
    }

    return actionName;
  }

  private formatActivityName(key: string): string {
    // Разделяем на action и target
    const parts = key.split('_');
    const action = parts[0] || '';
    const target = parts.slice(1).join('_') || null;

    // Упрощаем названия действий
    const actionMap: Record<string, string> = {
      'commented on': 'Commented',
      'pushed to': 'Pushed',
      'pushed new': 'Pushed (new)',
      accepted: 'Accepted',
      approved: 'Approved',
      closed: 'Closed',
      opened: 'Opened',
      deleted: 'Deleted',
    };

    let formattedAction = actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Если target null или пустой, возвращаем только action
    if (!target || target === 'null') {
      return formattedAction;
    }

    // Упрощаем названия типов
    const targetMap: Record<string, string> = {
      MergeRequest: 'MR',
      DiscussionNote: 'Discussion',
      DiffNote: 'Diff',
      Note: '',
      Issue: 'Issue',
    };

    const formattedTarget = targetMap[target] || target;

    // Для некоторых комбинаций возвращаем упрощенное название
    if (formattedAction === 'Commented' && !formattedTarget) {
      return 'Commented';
    }

    // Если target пустой после маппинга, возвращаем только action
    if (!formattedTarget) {
      return formattedAction;
    }

    return `${formattedAction} ${formattedTarget}`;
  }

  getPieChartOption(project: ProjectActivity) {
    const data = Object.entries(project.activityTypes).map(([name, value]) => ({
      name: this.formatActivityName(name),
      value,
    }));

    return {
      title: {
        text: project.projectName,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: 'Активность',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data,
        },
      ],
    };
  }
}
