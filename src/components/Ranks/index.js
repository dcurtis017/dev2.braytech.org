import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { flattenDepth, orderBy } from 'lodash';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../ObservedImage';
import ProgressBar from '../UI/ProgressBar';
import Spinner from '../UI/Spinner';
import * as utils from '../../utils/destinyUtils';
import * as bungie from '../../utils/bungie';

import './styles.css';

class Mode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      glory: {
        streak: 0,
        wins: false,
        loading: true
      }
    };

    this.data = {
      2772425241: {
        hash: 2772425241, // infamy
        activityHash: 3577607128,
        icon: '/static/images/extracts/ui/modes/01a3-00007365.png',
        currentResetCount: this.calculateResets(2772425241).current,
        totalResetCount: this.calculateResets(2772425241).total,
        totalPoints: utils.totalInfamy()
      },
      2626549951: {
        hash: 2626549951, // valor
        activityHash: 2274172949,
        icon: '/static/images/extracts/ui/modes/037E-000013D9.PNG',
        currentResetCount: this.calculateResets(3882308435).current,
        totalResetCount: this.calculateResets(3882308435).total,
        totalPoints: utils.totalValor()
      },
      2000925172: {
        hash: 2000925172, // glory
        definition: manifest.DestinyProgressionDefinition[2000925172],
        activityHash: 2947109551,
        icon: '/static/images/extracts/ui/modes/037E-000013EB.PNG',
        totalPoints: utils.totalGlory(),
        gains: {
          '0': {
            progressLoss: -60,
            progressGain: {
              '1': 80,
              '2': 100,
              '3': 120,
              '4': 140,
              '5': 160
            }
          },
          '1': {
            progressLoss: -60,
            progressGain: {
              '1': 80,
              '2': 100,
              '3': 120,
              '4': 140,
              '5': 160
            }
          },
          '2': {
            progressLoss: -60,
            progressGain: {
              '1': 80,
              '2': 100,
              '3': 120,
              '4': 140,
              '5': 160
            }
          },
          '3': {
            progressLoss: -60,
            progressGain: {
              '1': 68,
              '2': 88,
              '3': 108,
              '4': 136,
              '5': 148
            }
          },
          '4': {
            progressLoss: -60,
            progressGain: {
              '1': 68,
              '2': 88,
              '3': 108,
              '4': 136,
              '5': 148
            }
          },
          '5': {
            progressLoss: -60,
            progressGain: {
              '1': 68,
              '2': 88,
              '3': 108,
              '4': 136,
              '5': 148
            }
          },
          '6': {
            progressLoss: -52,
            progressGain: {
              '1': 60,
              '2': 80,
              '3': 100,
              '4': 128,
              '5': 140
            }
          },
          '7': {
            progressLoss: -52,
            progressGain: {
              '1': 60,
              '2': 80,
              '3': 100,
              '4': 128,
              '5': 140
            }
          },
          '8': {
            progressLoss: -52,
            progressGain: {
              '1': 60,
              '2': 80,
              '3': 100,
              '4': 128,
              '5': 140
            }
          },
          '9': {
            progressLoss: -60,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '10': {
            progressLoss: -60,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '11': {
            progressLoss: -60,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '12': {
            progressLoss: -68,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '13': {
            progressLoss: -68,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '14': {
            progressLoss: -68,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          },
          '15': {
            progressLoss: -68,
            progressGain: {
              '1': 40,
              '2': 60,
              '3': 80,
              '4': 108,
              '5': 120
            }
          }
        }
      }
    };
    
    this.currentLanguage = this.props.i18n.getCurrentLanguage();
  }

  calculateResets = progressionHash => {
    const { characterId, characterProgressions } = this.props.data;

    return {
      current: characterProgressions[characterId].progressions[progressionHash] && Number.isInteger(characterProgressions[characterId].progressions[progressionHash].currentResetCount) ? characterProgressions[characterId].progressions[progressionHash].currentResetCount : '?',
      total: characterProgressions[characterId].progressions[progressionHash] && characterProgressions[characterId].progressions[progressionHash].seasonResets
      ? characterProgressions[characterId].progressions[progressionHash].seasonResets.reduce((acc, curr) => {
          if (curr.season > 3) {
            return acc + curr.resets;
          } else {
            return acc;
          }
        }, 0)
      : '?'
    }
  }

  winsRequired = streakCount => {
    const { characterId, characterProgressions } = this.props.data;

    const debug = false;

    let stepsData = this.data[2000925172].definition.steps;
    let { stepIndex: currentStepIndex, stepIndex: workingStepIndex, progressToNextLevel: initialProgress, currentProgress } = characterProgressions[characterId].progressions[2000925172];
    let targetStepIndex = currentStepIndex < 9 ? 9 : 15;

    let winsRequired = 0;
    let winsStreak = Math.max(streakCount, 1);
    let totalProgress = currentProgress;
    let progress = initialProgress;

    if (debug) console.warn(`starting rank: ${stepsData[workingStepIndex].stepName} - ${currentProgress}`);

    // just to Fabled I or go all the way to Legend+
    while (targetStepIndex === 9 ? workingStepIndex < targetStepIndex : workingStepIndex <= targetStepIndex) {
      const currentStep = stepsData[workingStepIndex];

      if (debug) console.log(`stepIndex: ${workingStepIndex}, name: ${currentStep.stepName}`);

      if (debug) console.log(`win: streak ${winsStreak}, progress ${progress}/${currentStep.progressTotal}`);
      while (progress < currentStep.progressTotal) {
        progress = progress + this.data[2000925172].gains[workingStepIndex].progressGain[Math.min(winsStreak, 5)];
        totalProgress = totalProgress + this.data[2000925172].gains[workingStepIndex].progressGain[Math.min(winsStreak, 5)];

        winsRequired++;

        if (debug) console.log(`win: streak ${winsStreak}, progress ${progress}/${currentStep.progressTotal}`);
      }

      progress = Math.max(progress - currentStep.progressTotal, 0);

      workingStepIndex++;
    }

    if (debug) console.warn(`finishing rank: ${stepsData[Math.min(workingStepIndex, stepsData.length - 1)].stepName} - ${totalProgress}`);

    if (debug) console.log(winsRequired);

    return winsRequired;
  };

  getRecentActivity = async () => {
    const { hash, data } = this.props;
    const { membershipType, membershipId, characters } = data;

    if (hash === 2000925172) {
      const charactersIds = characters.map(c => c.characterId);

      let activities;

      try {
        let requests = charactersIds.map(async c => {
          let response = await bungie.GetActivityHistory(membershipType, membershipId, c, 5, 69, 0);
          return response.activities || [];
        });

        activities = await Promise.all(requests);
      } catch (e) {
        console.log(e);

        this.setState({ glory: { streak: false, wins: false, loading: false } });

        return;
      }

      activities = flattenDepth(activities, 1);
      activities = orderBy(activities, [ac => ac.period], ['desc']);

      let streakCount = 0;
      let streakBroken = false;
      activities.forEach((match, i) => {
        if (match.values.standing.basic.value !== 0) {
          streakBroken = true;
        }

        if (!streakBroken && match.values.standing.basic.value === 0) {
          streakCount++;
        }
      });

      let winsRequired = this.winsRequired(streakCount);

      this.setState({ glory: { streak: streakCount, wins: winsRequired, loading: false } });
    }
  };

  async componentDidMount() {
    this.getRecentActivity();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.member.data !== this.props.member.data && !this.state.glory.loading) {
      this.setState((prevState, props) => {
        prevState.glory.loading = true;
        return prevState;
      });
      this.getRecentActivity();
    }
  }

  render() {
    const { t, mini, hash } = this.props;
    const { characterId, characterProgressions } = this.props.data;

    // console.log(data[2000925172].gains)
    // console.log(characterProgressions[characterId].progressions[2000925172])
    
    let progressStepDescription = characterProgressions[characterId].progressions[hash].currentProgress === this.data[hash].totalPoints && characterProgressions[characterId].progressions[hash].stepIndex === manifest.DestinyProgressionDefinition[hash].steps.length ? manifest.DestinyProgressionDefinition[hash].steps[0].stepName : manifest.DestinyProgressionDefinition[hash].steps[(characterProgressions[characterId].progressions[hash].stepIndex + 1) % manifest.DestinyProgressionDefinition[hash].steps.length].stepName;

    if (this.currentLanguage === 'en') {
      progressStepDescription = progressStepDescription.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
      
      let omega = progressStepDescription.split(' ');

      if (omega.length >= 2) progressStepDescription = omega[0] + ' ' + omega[1].toUpperCase();
    }

    return (
      <div className={cx('rank', { mini })}>
        <div className='header'>
          <div className='icon'>
            <ObservedImage className='image' src={this.data[hash].icon} />
          </div>
          <div className='text'>{manifest.DestinyActivityDefinition[this.data[hash].activityHash].displayProperties.name}</div>
        </div>
        <div className='data'>
          {mini ? (
            <div>
              <div className='name'>{t('Total points')}</div>
              <div className='value'>{characterProgressions[characterId].progressions[hash].currentProgress.toLocaleString('en-us')}</div>
            </div>
          ) : null}
          {hash !== 2000925172 ? (
            <>
              <div>
                <div className='tooltip' data-hash='total_resets' data-table='BraytechDefinition'>
                  <div className='name'>{t('Total resets')}</div>
                  <div className='value'>{this.data[hash].totalResetCount}</div>
                </div>
              </div>
              <div>
                <div className='name'>{t('Season resets')}</div>
                <div className='value'>{this.data[hash].currentResetCount}</div>
              </div>
            </>
          ) : null}
          {hash === 2000925172 ? (
            <>
              <div>
                <div className='tooltip' data-hash='glory_streak_calc' data-table='BraytechDefinition'>
                  <div className='name'>{t('Win streak')}</div>
                  <div className='value'>{!this.state.glory.loading ? Number.isInteger(this.state.glory.streak) ? Math.max(this.state.glory.streak, 1) : t('Unknown') : <Spinner mini />}</div>
                </div>
              </div>
              <div>
                <div className='tooltip' data-hash='glory_wins_until' data-table='BraytechDefinition'>
                  <div className='name'>{characterProgressions[characterId].progressions[2000925172].stepIndex < 9 ? t('Fabled rank') : t('Legend rank')}</div>
                  <div className='value'>
                    {this.state.glory.wins} {this.state.glory.wins ? (this.state.glory.wins === 1 ? t('win') : t('wins')) : '-'}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
        {!mini ? (
          <div className='progress'>
            <ProgressBar
              classNames='step'
              objective={{
                progressDescription: progressStepDescription,
                completionValue: characterProgressions[characterId].progressions[hash].nextLevelAt
              }}
              progress={{
                progress: characterProgressions[characterId].progressions[hash].progressToNextLevel,
                objectiveHash: hash
              }}
              hideCheck
              chunky
            />
            <ProgressBar
              classNames='total'
              objective={{
                progressDescription: t('Total points'),
                completionValue: this.data[hash].totalPoints
              }}
              progress={{
                progress: characterProgressions[characterId].progressions[hash].currentProgress,
                objectiveHash: hash
              }}
              hideCheck
              chunky
            />
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withTranslation()
)(Mode);
