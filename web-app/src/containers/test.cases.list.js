import './styles/test.cases.list.scss'

import React, {Component} from 'react'
import pubsub from 'pubsub-js'
import {connect} from 'react-redux'
import {TestCaseItem} from '../components/test.case.item'
import {commonsUtils} from '../utils'
import {dataFormatter} from '../utils'
import {withTranslation} from 'react-i18next';

class FailedCasesList extends Component {
  state = {
    modalCases: [],
    groupedCases: null
  }

  getTestCaseHistory = (currentTestCase) => {
    const {cases = [], config: {historyBy = 'caseId'} = {}} = this.props
    console.log(historyBy)
    pubsub.publish('modal_view', {
      ...this.props,
      pie: true,
      cases: cases.filter(commonsUtils.filterFromUndefinedOrNull)
        .filter((testCase) => testCase[historyBy] === currentTestCase[historyBy]),
    })

  }

  renderTestCaseList = (cases) => {
    const {t} = this.props;
    return cases
      .filter(commonsUtils.filterFromUndefinedOrNull)
      .sort((a, b) => b.date > a.date)
      .filter((testCase, _, arr) => {
        const sameCases = arr.filter((_testCase) =>
          _testCase.caseId === testCase.caseId && testCase.date !== _testCase.date
        )
        if(sameCases.length === 0) {return true}
        return sameCases.every((_testCase) => testCase.date > _testCase.date)
      })
      .map((testCase, index) =>
        <TestCaseItem
          {...testCase}
          key={index}
          title={t('FailedCasesList.testCaseHistory')}
          onClick={() => this.getTestCaseHistory(testCase)}
        />
      )
  }

  renderGropTestCaseByList = () => {
    const {cases: [testCase]} = this.props
    return (
      <select onChange={({target: {value}}) => this.renderGroutedCases(value)}>
        <option>All</option>
        {Object.keys(testCase).map((item, index) => <option key={index}>{item}</option>)}
      </select>
    )
  }

  renderTestCaseListGrouped = (groupedTestCases) => {
    return Object.keys(groupedTestCases).map((groupKey, index) =>
      (<div key={index}>
        <div className="group identifier">{groupKey}</div>
        {this.renderTestCaseList(groupedTestCases[groupKey])}
      </div>)
    )
  }

  renderGroutedCases = (group) => {
    const {cases = []} = this.props
    if(group === 'All') {
      this.setState({
        groupedCases: null
      })
    } else {
      this.setState({
        groupedCases: dataFormatter.getGroupedByCases(
          group, cases.filter(commonsUtils.filterFromUndefinedOrNull)
        )
      })
    }
  }

  askToClose = () => {
    this.setState({modalCases: []})
  }

  render() {
    const {cases = [], t} = this.props
    const {groupedCases} = this.state
    return (
      <div>
        {
          cases.length && (
            <div>
              <div>{t('FailedCasesList.groupBy')}</div>
              {this.renderGropTestCaseByList()}
              {!groupedCases && this.renderTestCaseList(cases)}
              {groupedCases && this.renderTestCaseListGrouped(groupedCases)}
            </div>
          )
        }
      </div>
    )
  }
}

export default connect(({cases}) => ({...cases}))(withTranslation()(FailedCasesList))
