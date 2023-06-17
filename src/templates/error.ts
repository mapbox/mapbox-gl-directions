import template from "lodash.template"

const errorHtmlTemplate = `\
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-error'>
    <%= error %>
  </div>
</div>
`

export function createErrorTemplate(error: unknown) {
  return template(errorHtmlTemplate)({ error })
}
