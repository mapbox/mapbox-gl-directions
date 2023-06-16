export interface CreateInstructionsTemplateOptions {
  steps: any[]
  routes: number
  duration: unknown
  distance: unknown
  format: Function
  routeIndex: number
}

export function createInstructionsTemplate(options: CreateInstructionsTemplateOptions): string {
  return `
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-component mapbox-directions-route-summary ${
    options.routes > 1 ? 'mapbox-directions-multiple' : ''
  }
    ${
      options.routes < 1
        ? ''
        : Array.from(Array(options.routes))
            .map((i) => {
              return `
    <div class='mapbox-directions-routes mapbox-directions-clearfix'>
        <input type='radio' name='routes' id='${i}' ${i === options.routeIndex ? 'checked' : ''}>
        <label for='${i}' class='mapbox-directions-route'>${i + 1}</label>
    </div>
`
            })
            .join('')
    }
    <h1>${options.duration}</h1>
    <span>${options.distance}</span>
  </div>

  <div class='mapbox-directions-instructions'>
    <div class='mapbox-directions-instructions-wrapper'>
      <ol class='mapbox-directions-steps'>
        ${options.steps
          .map((step) => {
            const distance = step.distance && options.format(step.distance)

            let icon = step.maneuver.modifier
              ? step.maneuver.modifier.replace(/\s+/g, '-').toLowerCase()
              : step.maneuver.type.replace(/\s+/g, '-').toLowerCase()

            if (step.maneuver.type === 'arrive' || step.maneuver.type === 'depart') {
              icon = step.maneuver.type
            }

            if (step.maneuver.type === 'roundabout' || step.maneuver.type === 'rotary') {
              icon = 'roundabout'
            }

            const lng = step.maneuver.location[0]
            const lat = step.maneuver.location[1]

            return `
          <li
            data-lat='${lat}'
            data-lng='${lng}'
            class='mapbox-directions-step'>
            <span class='directions-icon directions-icon-${icon}'></span>
            <div class='mapbox-directions-step-maneuver'>
              ${step.maneuver.instruction}
            </div>
            ${distance ? `<div class='mapbox-directions-step-distance'> ${distance} </div>` : ''}
          </li>
`
          })
          .join('')}
      </ol>
    </div>
  </div>
</div>
`
}
