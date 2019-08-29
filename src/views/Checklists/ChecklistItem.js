import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Checkbox from '../../components/UI/Checkbox';

import './ChecklistItem.css';

const ChecklistItem = props => {
  const { completed, name, location, mapPath } = props;

  return (
    <li className={cx({ completed })}>
      <Checkbox checked={completed} children={(
        <>
          <div className='name'>{name}</div>
          {mapPath && (
            <div className='lowlines'>
              <a href={`https://lowlidev.com.au/${mapPath}?origin=BRAYTECH`} target='_blank' rel='noopener noreferrer'>
                <i className='segoe-uniE1C4' />
              </a>
            </div>
          )}
        </>
      )} />
      <div className='location'>{location}</div>
    </li>
  );
};

ChecklistItem.props = {
  completed: PropTypes.bool,
  mapPath: PropTypes.string
};

export default ChecklistItem;
