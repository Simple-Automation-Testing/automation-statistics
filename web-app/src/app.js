import './styles/app.scss';

import React, {Component} from 'react';
import pubsub from 'pubsub-js';
import {connect} from 'react-redux';
import {locationStorage} from './utils';
import {ModalWrapper} from './components';
import lsStore from './utils/local.storage';

import {withTranslation} from 'react-i18next';

import {
  FailedCasesList,
  ReportConfig,
  Header,
  StatisticsFlakyCases,
  StatisticsFailedReasons,
  RunStatistics,
  NavigationMenu,
  TechnicalSpecifications
} from './containers'

const contentMap = {
  RunStatistics,
  FailedCasesList,
  StatisticsFlakyCases,
  StatisticsFailedReasons,
  ReportConfig,
  TechnicalSpecifications
}

class App extends Component {

  state = {
    content: locationStorage.getLocationHash() || 'RunStatistics'
  }
  // TODO this approach can be improved
  UNSAFE_componentWillMount() {
    const {i18n} = this.props;
    const lang = lsStore.lsGet('lang');
    if(lang) {
      i18n.changeLanguage(lang);
    }
  }

  toggleContent = (name) => {
    this.setState({content: name})
    locationStorage.setLocationHash(name)
  }

  componentDidMount() {
    pubsub.subscribe('modal_view', (ms, modalData) => {
      this.setState({...this.state, modalData: {...modalData, isOpen: true}})
    })
  }

  render() {
    const {t} = this.props;
    const {content, modalData} = this.state
    const Content = contentMap[content]

    return (
      <div className="report-service-app">
        <ModalWrapper
          t={t}
          askToClose={() => this.setState({...this.state, modalData: null})}
          {...modalData}
        />
        <div className="report-service-header">
          <Header />
        </div>

        <div className="report-service-main-content">
          <div className="report-service-menu">

            <NavigationMenu
              toggleContent={this.toggleContent}
              navidationButtons={Object.keys(contentMap).map((key) => key)}
            />

          </div>

          <div className="report-service-content">

            <Content />

          </div>
        </div>

      </div >
    )
  }
}

export default connect(({cases: {config}}) => ({config}))(withTranslation()(App))
