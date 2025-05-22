/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  recordGAPageView, isLoggedIn
} from '../../common/utils';
import Error404 from '../errors/Error404';
import Error403 from '../errors/Error403';
import Error401 from '../errors/Error401';
import ErrorBoundary from '../errors/ErrorBoundary';
import Footer from './Footer';
import DocumentTitle from "./DocumentTitle"
import './App.scss';
import { hotjar } from 'react-hotjar';
import APIService from '../../services/APIService'
import Header from './Header';
import OIDLoginCallback from '../users/OIDLoginCallback';
import { OperationsContext } from './LayoutContext';
import Alert from '../common/Alert';
import MapProject from '../map-projects/MapProject'
import MapProjects from '../map-projects/MapProjects'

const AuthenticationRequiredRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => isLoggedIn() ? <Component {...props} /> : <Error401 />}
  />
)

const App = props => {
  const { alert, setAlert, setToggles } = React.useContext(OperationsContext);
  const setupHotJar = () => {
    /*eslint no-undef: 0*/
    const HID = window.HOTJAR_ID || process.env.HOTJAR_ID
    if(HID)
      hotjar.initialize(HID, 6);
  }

  const fetchToggles = async () => {
    return new Promise(resolve => {
      APIService.toggles().get().then(response => {
        setToggles(response.data)
        resolve();
      });
    });
  }

  const addLogoutListenerForAllTabs = () => window.addEventListener(
    "storage",
    event => {
      if(event.key === 'token' && !event.newValue) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if(!localStorage?.server)
          window.location = '/';
      }
    });

  React.useEffect(() => {
    fetchToggles()
    addLogoutListenerForAllTabs()
    recordGAPageView()
    setupHotJar()
  }, [])

  return (
    <div>
      <DocumentTitle/>
      <Header>
        <ErrorBoundary>
          <main className='content'>
            <Switch>
              <Route exact path="/oidc/login" component={OIDLoginCallback} />
              <AuthenticationRequiredRoute exact path='/' component={MapProjects} />
              <AuthenticationRequiredRoute exact path='/map-projects' component={MapProjects} />
              <AuthenticationRequiredRoute exact path='/map-projects/new' component={MapProject} />
              <AuthenticationRequiredRoute exact path='/:ownerType/:owner/map-projects/:projectId/edit' component={MapProject} />
              <Route exact path='/403' component={Error403} />
              <Route component={Error404} />
            </Switch>
            <Alert message={alert?.message} onClose={() => setAlert(false)} severity={alert?.severity} duration={alert?.duration} />
          </main>
        </ErrorBoundary>
        <Footer {...props} />
      </Header>
    </div>
  );
}

export default withRouter(App);

