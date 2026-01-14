import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model';
import type { GitLabActivityPageVM } from '../model';

export const FiltersCard = observer(() => {
  const model = useViewModel<GitLabActivityPageVM>();

  return (
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
  );
});
