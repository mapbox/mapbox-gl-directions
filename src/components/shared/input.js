import React, { Component, PropTypes } from 'react';
import AutoSuggest from 'react-autosuggest';

export default class Input extends Component {

  constructor(props) {
    super(props);
  }

  onChange(text) {
    this.props.onChange(text.trim());
  }

  clearQuery() {
    this.setState({ text: '' });
    var target = this.refs.input.getDOMNode();
    target.focus();
  }

  getSuggestions(input, cb) {
    cb(null, ['foo','bar','bat']);
  }

  render() {
    const { options, results } = this.props;

    console.log('Results', results);
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
          inputAttributes={inputAttributes}
          suggestions={this.getSuggestions.bind(this)}
        />

        {this.props.text && <button
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
  results: PropTypes.array.isRequired,
  options: PropTypes.object.isRequired
};
