import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import dudRecords from '../../../data/dudRecords';
import { enumerateRecordState } from '../../../utils/destinyEnums';
import { ProfileNavLink } from '../../../components/ProfileLink';
import ObservedImage from '../../../components/ObservedImage';
import Records from '../../../components/Records';

class PresentationNode extends React.Component {
  render() {
    const { member, collectibles } = this.props;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    let primaryHash = this.props.match.params.primary;
    let definitionPrimary = manifest.DestinyPresentationNodeDefinition[primaryHash];

    if (!definitionPrimary) {
      return null;
    }
    
    let secondaryHash = this.props.match.params.secondary ? this.props.match.params.secondary : definitionPrimary.children.presentationNodes[0].presentationNodeHash;
    let definitionSecondary = manifest.DestinyPresentationNodeDefinition[secondaryHash];

    let tertiaryHash = this.props.match.params.tertiary ? this.props.match.params.tertiary : definitionSecondary.children.presentationNodes[0].presentationNodeHash;
    let definitionTertiary = manifest.DestinyPresentationNodeDefinition[tertiaryHash];

    let quaternaryHash = this.props.match.params.quaternary ? this.props.match.params.quaternary : false;

    let primaryChildren = [];
    definitionPrimary.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      let isActive = (match, location) => {
        if (this.props.match.params.secondary === undefined && definitionPrimary.children.presentationNodes.indexOf(child) === 0) {
          return true;
        } else if (match) {
          return true;
        } else {
          return false;
        }
      };

      primaryChildren.push(
        <li key={node.hash} className='linked'>
          <ProfileNavLink isActive={isActive} to={`/triumphs/${primaryHash}/${node.hash}`}>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.displayProperties.icon}`} />
          </ProfileNavLink>
        </li>
      );
    });

    let secondaryChildren = [];
    definitionSecondary.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      if (node.redacted) {
        return;
      }

      let states = [];

      node.children.records.forEach(r => {
        const definitionRecord = manifest.DestinyRecordDefinition[r.recordHash];
        const scopeRecord = definitionRecord.scope || 0;
        const dataRecord = scopeRecord === 1 ? characterRecords[member.characterId].records[definitionRecord.hash] : profileRecords[definitionRecord.hash];

        if (collectibles.hideDudRecords && dudRecords.indexOf(r.recordHash) > -1) return;

        states.push(dataRecord);
      });

      let isActive = (match, location) => {
        if (this.props.match.params.tertiary === undefined && definitionSecondary.children.presentationNodes.indexOf(child) === 0) {
          return true;
        } else if (match) {
          return true;
        } else {
          return false;
        }
      };

      let secondaryProgress = states.filter(record => enumerateRecordState(record.state).recordRedeemed).length;
      let secondaryTotal = collectibles && collectibles.hideInvisibleRecords ? states.filter(record => !enumerateRecordState(record.state).invisible).length : states.length;

      if (secondaryTotal === 0) {
        return;
      }

      secondaryChildren.push(
        <li key={node.hash} className={cx('linked', { completed: secondaryProgress === secondaryTotal && secondaryTotal !== 0, active: definitionTertiary.hash === child.presentationNodeHash })}>
          <div className='text'>
            <div className='name'>{node.displayProperties.name.length > 24 ? node.displayProperties.name.slice(0, 24) + '...' : node.displayProperties.name}</div>
            <div className='progress'>
              <span>{secondaryProgress}</span> / {secondaryTotal}
            </div>
          </div>
          <ProfileNavLink isActive={isActive} to={`/triumphs/${primaryHash}/${secondaryHash}/${node.hash}`} />
        </li>
      );
    });

    return (
      <div className='node'>
        <div className='header'>
          <div className='name'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            {definitionPrimary.displayProperties.name} <span>{definitionPrimary.children.presentationNodes.length !== 1 ? <>// {definitionSecondary.displayProperties.name}</> : null}</span>
          </div>
        </div>
        <div className='children'>
          <ul
            className={cx('list', 'primary', {
              'single-primary': definitionPrimary.children.presentationNodes.length === 1
            })}
          >
            {primaryChildren}
          </ul>
          <ul className='list secondary'>{secondaryChildren}</ul>
        </div>
        <div className='entries'>
          <ul className='list tertiary record-items'>
            <Records hashes={definitionTertiary.children.records.map(child => child.recordHash)} highlight={quaternaryHash} readLink={primaryHash === '564676571'} />
          </ul>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    collectibles: state.collectibles
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(PresentationNode);
