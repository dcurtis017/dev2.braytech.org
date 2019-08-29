import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import ObservedImage from '../../../components/ObservedImage';
import Collectibles from '../../../components/Collectibles';
import Search from '../../../components/Search';
import { ProfileLink } from '../../../components/ProfileLink';
import { enumerateCollectibleState } from '../../../utils/destinyEnums';

class Root extends React.Component {
  render() {
    const { t, member } = this.props;

    const characterCollectibles = member.data.profile.characterCollectibles.data;
    const profileCollectibles = member.data.profile.profileCollectibles.data;

    const parent = manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.collectionRootNode];
    const parentBadges = manifest.DestinyPresentationNodeDefinition[manifest.settings.destiny2CoreSettings.badgesRootNode];

    let nodes = [];
    let badges = [];
    let collectionsStates = [];
    let badgesStates = [];

    // items nodes
    parent.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];
      let states = [];

      node.children.presentationNodes.forEach(nodeChild => {
        let nodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChild.presentationNodeHash];
        nodeChildNode.children.presentationNodes.forEach(nodeChildNodeChild => {
          let nodeChildNodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChildNodeChild.presentationNodeHash];
          if (nodeChildNodeChildNode.children.presentationNodes.length > 0) {
            nodeChildNodeChildNode.children.presentationNodes.forEach(nodeChildNodeChildNodeChild => {
              let nodeChildNodeChildNodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChildNodeChildNodeChild.presentationNodeHash];
              nodeChildNodeChildNodeChildNode.children.collectibles.forEach(collectible => {
                let scope = profileCollectibles.collectibles[collectible.collectibleHash] ? profileCollectibles.collectibles[collectible.collectibleHash] : characterCollectibles[member.characterId].collectibles[collectible.collectibleHash];
                if (scope) {
                  states.push(scope.state);
                  collectionsStates.push(scope.state);
                } else {
                  console.log(`57 Undefined state for ${collectible.collectibleHash}`);
                }
              });
            });
          } else {
            nodeChildNodeChildNode.children.collectibles.forEach(collectible => {
              let scope = profileCollectibles.collectibles[collectible.collectibleHash] ? profileCollectibles.collectibles[collectible.collectibleHash] : characterCollectibles[member.characterId].collectibles[collectible.collectibleHash];
              if (scope) {
                states.push(scope.state);
                collectionsStates.push(scope.state);
              } else {
                console.log(profileCollectibles.collectibles[collectible.collectibleHash], characterCollectibles[member.characterId].collectibles[collectible.collectibleHash], `68 Undefined state for ${collectible.collectibleHash}`);
              }
            });
          }
        });
      });

      let nodeProgress = states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length;
      let nodeTotal = states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length;

      nodes.push(
        <div key={node.hash} className={cx('node', { completed: nodeTotal > 0 && nodeProgress === nodeTotal })}>
          <div className='images'>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.originalIcon}`} />
          </div>
          <div className='text'>
            <div>{node.displayProperties.name}</div>
            <div className='state'>
              <span>{nodeProgress}</span> / {nodeTotal}
            </div>
          </div>
          <ProfileLink to={`/collections/${node.hash}`} />
        </div>
      );
    });

    // badges
    parentBadges.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];
      let classes = [];
      let fullComplete = 0;
      let semiComplete = false;

      node.children.presentationNodes.forEach(nodeChild => {
        let nodeChildNode = manifest.DestinyPresentationNodeDefinition[nodeChild.presentationNodeHash];

        let sweep = [];
        nodeChildNode.children.collectibles.forEach(collectible => {
          let scope = profileCollectibles.collectibles[collectible.collectibleHash] ? profileCollectibles.collectibles[collectible.collectibleHash] : characterCollectibles[member.characterId].collectibles[collectible.collectibleHash];
          if (scope) {
            sweep.push(scope.state);
          } else {
            console.log(`105 Undefined state for ${collectible.collectibleHash}`);
          }
        });

        classes.push({
          className: nodeChildNode.displayProperties.name,
          states: sweep
        });
      });

      classes.forEach(obj => {
        if (obj.states.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === obj.states.filter(collectible => !enumerateCollectibleState(collectible).invisible).length) {
          fullComplete += 1;
          semiComplete = true;
        }
      });

      if (semiComplete) {
        badgesStates.push(node.displayProperties.name);
      }

      badges.push(
        <li
          key={node.hash}
          className={cx('badge', 'linked', {
            semiComplete: semiComplete,
            fullComplete: fullComplete === 3
          })}
        >
          <ProfileLink to={`/collections/badge/${node.hash}`}>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.originalIcon}`} />
            <div className='text'>
              <div>{node.displayProperties.name}</div>
            </div>
          </ProfileLink>
        </li>
      );
    });

    return (
      <>
        <div className='nodes'>
          <div className='sub-header'>
            <div>{t('Items')}</div>
            <div>
              {collectionsStates.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length}/{collectionsStates.filter(collectible => !enumerateCollectibleState(collectible).invisible).length}
            </div>
          </div>
          <div className='node'>
            <div className='parent'>{nodes}</div>
          </div>
        </div>
        <div className='sidebar'>
          <div className='sub-header'>
            <div>{t('Search')}</div>
          </div>
          <Search scope='collectibles' />
          {profileCollectibles.recentCollectibleHashes ? (
            <>
              <div className='sub-header'>
                <div>{t('Recently discovered')}</div>
              </div>
              <div className='recently-discovered'>
                <ul className='list collection-items'>
                  <Collectibles selfLinkFrom='/collections' forceDisplay hashes={profileCollectibles.recentCollectibleHashes.slice().reverse()} />
                </ul>
              </div>
            </>
          ) : null}
          <div className='sub-header'>
            <div>{t('Badges')}</div>
            <div>
              {badgesStates.length}/{parentBadges.children.presentationNodes.length}
            </div>
          </div>
          <div className='badges'>
            <ul className='list'>{badges}</ul>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(
    mapStateToProps
  ),
  withTranslation()
)(Root);
