import template from 'lodash.template'
import type { MapboxProfile, MapDirectionsControls } from '../index.js'

export interface CreateInputsTemplateOptions {
  profile: MapboxProfile
  controls?: MapDirectionsControls
}

const inputsHtmlTemplate = `\
<div class='mapbox-directions-component mapbox-directions-inputs'>
  <div class='mapbox-directions-component-keyline'>
    <div class='mapbox-directions-origin'>
      <label class='mapbox-form-label'>
        <span class='directions-icon directions-icon-depart'></span>
      </label>
      <div id='mapbox-directions-origin-input'></div>
    </div>

    <button
      class='directions-icon directions-icon-reverse directions-reverse js-reverse-inputs'
      title='Reverse origin &amp; destination'>
    </button>

    <div class='mapbox-directions-destination'>
      <label class='mapbox-form-label'>
        <span class='directions-icon directions-icon-arrive'></span>
      </label>
      <div id='mapbox-directions-destination-input'></div>
    </div>
  </div>

  <% if (controls.profileSwitcher) { %>
  <div class='mapbox-directions-profile mapbox-directions-component-keyline mapbox-directions-clearfix'><input
      id='mapbox-directions-profile-driving-traffic'
      type='radio'
      name='profile'
      value='mapbox/driving-traffic'
      <% if (profile === 'mapbox/driving-traffic') { %>checked<% } %>
    />
    <label for='mapbox-directions-profile-driving-traffic'>Traffic</label>
    <input
      id='mapbox-directions-profile-driving'
      type='radio'
      name='profile'
      value='mapbox/driving'
      <% if (profile === 'mapbox/driving') { %>checked<% } %>
    />
    <label for='mapbox-directions-profile-driving'>Driving</label>
    <input
      id='mapbox-directions-profile-walking'
      type='radio'
      name='profile'
      value='mapbox/walking'
      <% if (profile === 'mapbox/walking') { %>checked<% } %>
    />
    <label for='mapbox-directions-profile-walking'>Walking</label>
    <input
      id='mapbox-directions-profile-cycling'
      type='radio'
      name='profile'
      value='mapbox/cycling'
      <% if (profile === 'mapbox/cycling') { %>checked<% } %>
    />
    <label for='mapbox-directions-profile-cycling'>Cycling</label>
  </div>
  <% } %>
</div>
`

export function createInputsTemplate(options: CreateInputsTemplateOptions): string {
  return template(inputsHtmlTemplate)(options)
}
