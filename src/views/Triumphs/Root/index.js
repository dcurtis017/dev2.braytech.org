import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import dudRecords from '../../../data/dudRecords';
import { enumerateRecordState } from '../../../utils/destinyEnums';
import { ProfileLink } from '../../../components/ProfileLink';
import ObservedImage from '../../../components/ObservedImage';
import RecordsAlmost from '../../../components/RecordsAlmost';
import RecordsTracked from '../../../components/RecordsTracked';
import Search from '../../../components/Search';

class Root extends React.Component {
  render() {
    const { t, member, collectibles } = this.props;
    const character = member.data.profile.characters.data.find(c => c.characterId === member.characterId);
    const profileRecords = member.data.profile.profileRecords.data.records;
    const characterRecords = member.data.profile.characterRecords.data;

    const sealBars = {
      2588182977: {
        image: '037E-00001367.png'
      },
      3481101973: {
        image: '037E-00001343.png'
      },
      147928983: {
        image: '037E-0000134A.png'
      },
      2693736750: {
        image: '037E-0000133C.png'
      },
      2516503814: {
        image: '037E-00001351.png'
      },
      1162218545: {
        image: '037E-00001358.png'
      },
      2039028930: {
        image: '0560-000000EB.png'
      },
      991908404: {
        image: '0560-0000107E.png'
      },
      3170835069: {
        image: '0560-00006583.png'
      },
      1002334440: {
        image: '0560-00007495.png'
      }
    };

    let parent = manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.recordsRootNode];
    let sealsParent = manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.medalsRootNode];

    let nodes = [];
    let sealNodes = [];
    let recordsStates = [];

    parent.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];
      let states = [];

      node.children.presentationNodes.forEach(nodeChild => {
        let nodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChild.presentationNodeHash];
        nodeChildNode.children.presentationNodes.forEach(nodeChildNodeChild => {
          let nodeChildNodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChildNodeChild.presentationNodeHash];
          if (nodeChildNodeChildNode.redacted) {
            return;
          }
          nodeChildNodeChildNode.children.records.forEach(record => {
            let scope = profileRecords[record.recordHash] ? profileRecords[record.recordHash] : characterRecords[member.characterId].records[record.recordHash];
            let def = manifest.DestinyRecordDefinition[record.recordHash] || false;
            if (scope) {

              if (collectibles.hideDudRecords && dudRecords.indexOf(record.recordHash) > -1) return;

              scope.hash = record.recordHash;
              scope.scoreValue = def && def.completionInfo ? def.completionInfo.ScoreValue : 0;
              states.push(scope);
              recordsStates.push(scope);
            }
          });
        });
      });

      let nodeProgress = states.filter(record => enumerateRecordState(record.state).recordRedeemed).length;
      let nodeTotal = states.filter(record => !enumerateRecordState(record.state).invisible).length;

      nodes.push(
        <li key={node.hash} className={cx('linked', { completed: nodeTotal > 0 && nodeProgress === nodeTotal })}>
          {nodeTotal && nodeProgress !== nodeTotal ? <div className='progress-bar-background' style={{ width: `${(nodeProgress / nodeTotal) * 100}%` }} /> : null}
          <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.originalIcon}`} />
          <div className='displayProperties'>
            <div className='name'>{node.displayProperties.name}</div>
            {nodeTotal ? <div className='progress'>
              <span>{nodeProgress}</span> / {nodeTotal}
            </div> : null}
          </div>
          <ProfileLink to={`/triumphs/${node.hash}`} />
        </li>
      );
    });

    sealsParent.children.presentationNodes.forEach(child => {
      let definitionSeal = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];
      let states = [];

      if (definitionSeal.redacted) {
        return;
      }

      definitionSeal.children.records.forEach(record => {
        let scope = profileRecords[record.recordHash] ? profileRecords[record.recordHash] : characterRecords[member.characterId].records[record.recordHash];
        if (scope) {
          states.push(scope);
          recordsStates.push({...scope, seal: true});
        }
      });

      let nodeProgress = profileRecords[definitionSeal.completionRecordHash] && profileRecords[definitionSeal.completionRecordHash].objectives[0].progress;
      let nodeTotal = profileRecords[definitionSeal.completionRecordHash] && profileRecords[definitionSeal.completionRecordHash].objectives[0].completionValue;

      // // MOMENTS OF TRIUMPH: MMXIX does not have the above ^
      if (definitionSeal.hash === 1002334440) {
        nodeProgress = states.filter(s => !enumerateRecordState(s.state).objectiveNotCompleted && enumerateRecordState(s.state).recordRedeemed).length;
        nodeTotal = states.length;
      }

      let isComplete = nodeTotal && nodeProgress === nodeTotal ? true : false;

      sealNodes.push({
        completed: isComplete,
        element: (
          <li
            key={definitionSeal.hash}
            className={cx('linked', {
              completed: nodeTotal && isComplete
            })}
          >
            {nodeTotal && nodeProgress !== nodeTotal ? <div className='progress-bar-background' style={{ width: `${(nodeProgress / nodeTotal) * 100}%` }} /> : null}
            <ObservedImage className={cx('image', 'icon')} src={sealBars[definitionSeal.hash] ? `/static/images/extracts/badges/${sealBars[definitionSeal.hash].image}` : `https://www.bungie.net${definitionSeal.displayProperties.icon}`} />
            <div className='displayProperties'>
              <div className='name'>{manifest.DestinyRecordDefinition[definitionSeal.completionRecordHash].titleInfo.titlesByGenderHash[character.genderHash]}</div>
              {nodeTotal ? (
                <div className='progress'>
                  <span>{nodeProgress}</span> / {nodeTotal}
                </div>
              ) : null}
            </div>
            <ProfileLink to={`/triumphs/seal/${definitionSeal.hash}`} />
          </li>
        )
      });
    });

    let unredeemedTriumphCount = recordsStates.filter(record => !enumerateRecordState(record.state).recordRedeemed && !enumerateRecordState(record.state).objectiveNotCompleted).length;

    return (
      <>
        <div className='module'>
          <div className='sub-header'>
            <div>{t('Total score')}</div>
          </div>
          <div className='total-score'>{this.props.member.data.profile.profileRecords.data.score}</div>
          {unredeemedTriumphCount > 0 ? (
            <ul className='list record-items notification-unredeemed'>
              <li className='linked unredeemed'>
                <div className='text'>{unredeemedTriumphCount} {t('unredeemed triumphs')}</div>
                <i className='segoe-uniE0AB' />
                <ProfileLink to={{ pathname: '/triumphs/unredeemed', state: { from: '/triumphs' } }} />
              </li>
            </ul>
          ) : null}
          <div className='sub-header'>
            <div>{t('Search')}</div>
          </div>
          <Search scope='records' />
          <div className='sub-header'>
            <div>{t('Triumphs')}</div>
            <div>
              {recordsStates.filter(state => !state.seal).filter(state => enumerateRecordState(state.state).recordRedeemed).length}/{recordsStates.filter(state => !state.seal).filter(state => !enumerateRecordState(state.state).invisible).length}
            </div>
          </div>
          <ul className='list parents'>{nodes}</ul>
          <div className='sub-header'>
            <div>{t('Seals')}</div>
            <div>
              {sealNodes.filter(n => n.completed).length}/{sealNodes.length}
            </div>
          </div>
          <ul className='list parents seals'>{sealNodes.map(n => n.element)}</ul>
        </div>
        <div className='module'>
          <div className='sub-header'>
            <div>{t('Almost complete')}</div>
          </div>
          <div className='almost-complete'>
            <RecordsAlmost limit='5' selfLinkFrom='/triumphs' pageLink />
          </div>
        </div>
        <div className='module'>
          <div className='sub-header'>
            <div>{t('Tracked records')}</div>
          </div>
          <div className='tracked'>
            <RecordsTracked limit='5' selfLinkFrom='/triumphs' pageLink />
          </div>
        </div>
      </>
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
  connect(mapStateToProps),
  withTranslation()
)(Root);
