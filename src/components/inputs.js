import React, { Component, PropTypes } from 'react';
import debounce from 'debounce';
import Input from './shared/input';
import Geocoder from 'react-geocoder';

export default class Inputs extends Component {

  constructor() {
    super();
  }

  componentWillMount() {
    this.onInputChange = debounce(this.onInputChange, 100);
  }

  onInputChange(value) {
    console.log(value);
  }

  query() {
    console.log('result from geocoder', arguments);
  }

  render() {
    const { actions } = this.props;

    return (
      <div className='mapbox-directions-component mapbox-directions-inputs'>
        <Input
          {...actions}
          onChange={this.onInputChange}
          options={{
            mode:'origin',
            placeholder:'start',
            icon:'depart'
          }}
        />
        <span className='directions-icon directions-icon-reverse directions-reverse' title='Reverse origin &amp; destination'></span>
        <Input
          {...actions}
          onChange={this.onInputChange}
          options={{
            mode:'destination',
            placeholder:'end',
            icon:'arrive'
          }}
        />

        {this.props.results && <div className='mapbox-directions-profile'>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-driving'
            />
            <label htmlFor='mapbox-directions-profile-driving'>Driving</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-walking'
            />
            <label htmlFor='mapbox-directions-profile-walking'>Walking</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-cycling'
            />
            <label htmlFor='mapbox-directions-profile-cycling'>Cycling</label>
          </span>
        </div>}
      </div>
    );
  }
}

Inputs.propTypes = {
  actions: PropTypes.object.isRequired,
  inputs: PropTypes.object.isRequired
};
