import template from 'lodash.template'

export interface CreateInstructionsTemplateOptions {
  steps: any[]
  routes: number
  duration: unknown
  distance: unknown
  format: Function
  routeIndex: number
}

const instructionsHtmlTemplate = `\
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-component mapbox-directions-route-summary<% if (routes > 1) { %> mapbox-directions-multiple<% } %>'>
    <% if (routes > 1) { %>
    <div class='mapbox-directions-routes mapbox-directions-clearfix'>
      <% for (var i = 0; i < routes; i++) { %>
        <input type='radio' name='routes' id='<%= i %>' <% if (i === routeIndex) { %>checked<% } %>>
        <label for='<%= i %>' class='mapbox-directions-route'><%= i + 1 %></label>
      <% } %>
    </div>
    <% } %>
    <h1><%- duration %></h1>
    <span><%- distance %></span>
  </div>

  <div class='mapbox-directions-instructions'>
    <div class='mapbox-directions-instructions-wrapper'>
      <ol class='mapbox-directions-steps'>
        <% steps.forEach(function(step) { %>
          <%
            var distance = step.distance ? format(step.distance) : false;
            var icon = step.maneuver.modifier ? step.maneuver.modifier.replace(/\s+/g, '-').toLowerCase() : step.maneuver.type.replace(/\s+/g, '-').toLowerCase();

            if (step.maneuver.type === 'arrive' || step.maneuver.type === 'depart') {
              icon = step.maneuver.type;
            }

            if (step.maneuver.type === 'roundabout' || step.maneuver.type === 'rotary') {
              icon= 'roundabout';
            }

            var lng = step.maneuver.location[0];
            var lat = step.maneuver.location[1];
          %>
          <li
            data-lat='<%= lat %>'
            data-lng='<%= lng %>'
            class='mapbox-directions-step'>
            <span class='directions-icon directions-icon-<%= icon %>'></span>
            <div class='mapbox-directions-step-maneuver'>
              <%= step.maneuver.instruction %>
            </div>
            <% if (distance) { %>
              <div class='mapbox-directions-step-distance'>
                <%= distance %>
              </div>
            <% } %>
          </li>
        <% }); %>
      </ol>
    </div>
  </div>
</div>
`

export function createInstructionsTemplate(options: CreateInstructionsTemplateOptions): string {
  return template(instructionsHtmlTemplate)(options)
}
