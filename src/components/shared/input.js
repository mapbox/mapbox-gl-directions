import React, { Component, PropTypes } from 'react';
import AutoSuggest from 'react-autosuggest';

export default class Input extends Component {

  constructor(props) {
    super(props);
  }

  onChange(text) {
    console.log('onChange event fired', text);
    if (text) this.props.onChange(text);
  }

  clearQuery() {
    this.props.onClear();
  }

  getSuggestions(input, cb) {
    cb(null, this.props.results.reduce((memo, d) => {
      memo.push(d.place_name);
      return memo;
    }, []));
  }

  setResult(v) {
    var result = this.props.results.filter((d) => {
      return v === d.place_name;
    })[0];

    console.log('Selected result', result);
  }

  render() {
    const { options } = this.props;

    const inputAttributes = {
      placeholder: options.placeholder,
      onChange: this.onChange.bind(this)
    };

    return (
      <div className={`mapbox-directions-${options.mode}`}>
        <label className='mapbox-form-label'>
          <span className={`directions-icon directions-icon-${options.icon}`}></span>
        </label>

        <AutoSuggest
          ref='autosuggest'
          inputAttributes={inputAttributes}
          suggestions={this.getSuggestions.bind(this)}
          onSuggestionSelected={this.setResult.bind(this)}
        />

        {options.value && <button
          onClick={this.clearQuery.bind(this)}
          className='directions-icon directions-icon-close directions-close'
          title='Clear value'>
        </button>}
      </div>
    );
  }
}

Input.propTypes = {
  text: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  options: PropTypes.object.isRequired
};
