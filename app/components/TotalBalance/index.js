// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import TezosAmount from '../TezosAmount';
import { getTotalBalance } from '../../reducers/address.duck';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Text = styled.span`
  font-size: ${ms(1)};
  font-family: ${({ theme }) => theme.typo.fontFamily.primary};
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.gray3};
  padding-left: ${ms(2)};
`;

const Amount = styled(TezosAmount)`
  margin-left: ${ms(2)};
`;

type Props = {
  totalBalance: number
};

class TotalBalance extends Component {
  render() {
    const { totalBalance } = this.props;
    return (
      <Container>
        <Text>Total Balance</Text>
        <Amount
          size={ms(3)}
          amount={totalBalance}
          color="primary"
          weight="normal"
          showTooltip
        />
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    totalBalance: getTotalBalance(state)
  };
};

export default connect(mapStateToProps, null)(TotalBalance);
