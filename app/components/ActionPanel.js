// @flow
import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { isEmpty } from 'lodash'

import { getSelectedAccount } from '../utils/general';
import { findIdentity, findIdentityIndex } from '../utils/identity';
import Button from './Button';
import BalanceBanner from './BalanceBanner';
import EmptyState from './EmptyState';
import PageNumbers from './PageNumbers';
import Transactions from './Transactions';
import Send from './Send';
import Receive from './Receive';
import Delegate from './Delegate';
import Loader from './Loader';
import tabConstants from '../constants/tabConstants';
import { ms } from '../styles/helpers';
import transactionsEmptyState from '../../resources/transactionsEmptyState.svg'

import { syncWallet } from '../reducers/address.duck';

const Container = styled.section`
  flex-grow: 1;
`;

const Tab = styled(Button)`
  background: ${({ isActive, theme: { colors } }) =>
  isActive ? colors.white : colors.accent};
  color: ${({ isActive, theme: { colors } }) =>
  isActive ? colors.primary : lighten(0.4, colors.accent)};
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  padding: ${ms(-1)} ${ms(1)};
  border-radius: 0;
`;

const TabList = styled.div`
  background-color: ${({ theme: { colors } }) => colors.blue};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 150px);
  background-color: white;
  padding: ${ms(4)};
`;

const Link = styled.span`
  color: ${ ({ theme: { colors } }) => colors.blue };
  cursor: pointer;
`

const DescriptionContainer = styled.p`
  color: ${ ({ theme: { colors } }) => colors.gray5 };
  text-align: center;
`

type DescriptionProps = {
  onSendClick: Function,
  onReceiveClick: Function
}

const Description = (props:DescriptionProps) => {
  const { onSendClick, onReceiveClick } = props
  return (
    <DescriptionContainer>
      It's pretty empty here. Get started
      <Link onClick={onSendClick}> sending</Link> and
      <Link onClick={onReceiveClick}> receiving</Link> tez from this address.
    </DescriptionContainer>
  )
}

const { TRANSACTIONS, SEND, RECEIVE, DELEGATE } = tabConstants;

type Props = {
  identities: array,
  isLoadingTransactions: boolean,
  selectedAccountHash: string,
  selectedParentHash: string,
  syncWallet: Function
};

type State = {
  activeTab: string,
  currentPage: number
};

class ActionPanel extends Component<Props, State> {
  props: Props;

  state = {
    activeTab: TRANSACTIONS,
    currentPage: 1
  };

  handleLinkPress = tab => {
    this.setState({ activeTab: tab })
  }

  renderSection = ( transactions ) => {
    const { selectedAccountHash } = this.props;

    switch (this.state.activeTab) {
      case DELEGATE:
        return (
          <SectionContainer>
            <Delegate />
          </SectionContainer>
        );
      case RECEIVE:
        return (
          <SectionContainer>
            <Receive address={selectedAccountHash} />
          </SectionContainer>
        );
      case SEND:
        return (
          <SectionContainer>
            <Send />
          </SectionContainer>
        );
      case TRANSACTIONS:
      default: {
        return (
          <SectionContainer>
            {
              isEmpty(transactions.toJS())
                ?
                <EmptyState
                  imageSrc={transactionsEmptyState}
                  title={'You have not made any transactions yet'}
                  description={
                  <Description
                    onReceiveClick={() => this.handleLinkPress(RECEIVE)}
                    onSendClick={() => this.handleLinkPress(SEND)}
                  />}
                />
                :
                <Fragment>
                  <Transactions transactions={transactions} />
                  <PageNumbers
                    currentPage={this.state.currentPage}
                    numberOfPages={4}
                    onClick={currentPage => this.setState({ currentPage })}
                  />
                  {this.props.isLoadingTransactions && <Loader />}
                </Fragment>
            }
          </SectionContainer>
        );
      }
    }
  };

  render() {
    const tabs = [TRANSACTIONS, SEND, RECEIVE];

    const { selectedAccountHash, selectedParentHash, selectedAccount, parentIdentity, parentIndex, syncWallet } = this.props;
    const transactions = selectedAccount.get('transactions');
    const balance = selectedAccount.get('balance');
    const  isManagerAddress = selectedAccountHash === selectedParentHash;
    const { activeTab } = this.state;

    return (
      <Container>
        <BalanceBanner
          balance={balance || 0}
          publicKeyHash={selectedAccountHash || 'Inactive'}
          parentIdentity={parentIdentity}
          parentIndex={parentIndex}
          isManagerAddress={isManagerAddress}
          onRefreshClick={syncWallet}
        />

        <TabList>
          {tabs.map(tab => (
            <Tab
              isActive={activeTab === tab}
              key={tab}
              buttonTheme="plain"
              onClick={() => this.setState({ activeTab: tab })}
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        { this.renderSection(transactions) }
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const { address } = state;
  const identities = address.get('identities');
  const jsIdentities = identities.toJS();
  const selectedAccountHash = address.get('selectedAccountHash');
  const selectedParentHash = address.get('selectedParentHash');

  return {
    identities,
    isLoadingTransactions: address.get('isLoading'),
    selectedAccountHash,
    selectedAccount: getSelectedAccount(jsIdentities, selectedAccountHash, selectedParentHash),
    selectedParentHash,
    parentIdentity: findIdentity(jsIdentities, selectedParentHash),
    parentIndex:  findIdentityIndex(jsIdentities, selectedParentHash) + 1

  };
}
function mapDispatchToProps(dispatch: Function) {
  return bindActionCreators(
    {
      syncWallet
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
