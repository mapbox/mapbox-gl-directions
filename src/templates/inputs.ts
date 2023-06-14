import { MapboxProfiles, type MapboxProfile, type MapDirectionsControls } from '../directions'

export interface CreateInputTemplateOptions {
  profile: MapboxProfile
  controls?: MapDirectionsControls
}

/**
 * Portion of the input HTML that's always the same.
 */
const staticInputsTemplate = `\
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
`

interface RadioTemplateOptions {
  id: string
  label: string
  value: string
  checked: boolean
}

/**
 * Helper function to create a radio input HTML string for the specified MapBox profile.
 */
const createRadioInputTemplate = ({ id, label, value, checked }: RadioTemplateOptions) => `\
<input id='${id}' type='radio' name='profile' value='${value}' ${checked ? 'checked' : ''} />
<label for='${id}'>${label}</label>
`

const MapboxInputs: Record<MapboxProfile, Omit<RadioTemplateOptions, 'checked'>> = {
  'mapbox/driving-traffic': {
    id: 'mapbox-directions-profile-driving-traffic',
    label: 'Traffic',
    value: 'mapbox/driving-traffic'
  },
  'mapbox/driving': {
    id: 'mapbox-directions-profile-driving',
    label: 'Driving',
    value: 'mapbox/driving'
  },
  'mapbox/walking': {
    id: 'mapbox-directions-profile-walking',
    label: 'Walking',
    value: 'mapbox/walking'
  },
  'mapbox/cycling': {
    id: 'mapbox-directions-profile-cycling',
    label: 'Cycling',
    value: 'mapbox/cycling'
  }
}

export function createInputsTemplate({ profile, controls }: CreateInputTemplateOptions) {
  const radioInputsTemplate = controls?.profileSwitcher ? MapboxProfiles.map(mapboxProfile =>
    createRadioInputTemplate({
      ...MapboxInputs[mapboxProfile],
      checked: profile === `mapbox/${mapboxProfile}`
    })
  ).join('') : ''

  const wrappedRadioInputTemplate = radioInputsTemplate ?
    `\
<div class='mapbox-directions-profile mapbox-directions-component-keyline mapbox-directions-clearfix'>
  ${radioInputsTemplate}
</div>
` : ''

  const inputsTemplate = `\
<div class='mapbox-directions-component mapbox-directions-inputs'>
  ${staticInputsTemplate}
  ${wrappedRadioInputTemplate}
</div>
`
  return inputsTemplate
}
