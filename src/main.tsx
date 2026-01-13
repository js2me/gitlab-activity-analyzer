import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.css';
import { viewModelsConfig } from 'mobx-view-model';

viewModelsConfig.observable.viewModels.useDecorators = false;
viewModelsConfig.observable.viewModelStores.useDecorators = false;

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
