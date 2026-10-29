import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");

let selectedIndex = -1;
let s_idx = -1;
let query = "";
let searchInput = document.querySelector(".searchBar");

function renderPieChart(projectsGiven) {
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year }; // TODO
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  // TODO: clear up paths and legends
  let total = 0;
  for (let d of newData) {
    total += d;
  }
  let angle = 0;
  for (let d of newData) {
    let endAngle = angle + (d / total) * 2 * Math.PI;
    newArcData.push({ startAngle: angle, endAngle });
    angle = endAngle;
  }
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  newArcs.forEach((arc, i) => {
    d3.select("svg").append("path").attr("d", arc).attr("fill", colors(i));
  });

  let svg = d3.select("svg");
  svg.selectAll("path").remove();
  newArcs.forEach((arc, i) => {
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(i))
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));
        legend
          .selectAll("li")
          .attr("class", (_, idx) =>
            idx === selectedIndex ? "legend-items selected" : "legend-items",
          );
        let search = searchInput.value;
        let project_to_use =
          search === null
            ? projectsGiven
            : projectsGiven.filter((project) => {
				let values = Object.values(project).join("\n").toLowerCase();
    			return values.includes(search.toLowerCase());
			});
        if (selectedIndex === -1) {
          renderProjects(project_to_use, projectsContainer, "h2");
        } else {
          s_idx = newData[selectedIndex].label;
          let f_projects = project_to_use.filter(
            (project) => project.year == s_idx,
          );
          renderProjects(f_projects, projectsContainer, "h2");
        }
        console.log(selectedIndex);
      });
  });

  let legend = d3.select(".legend");
  newData.forEach((d, idx) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
      .attr("class", "legend-items");
  });
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener("change", (event) => {
  // update query value
  let newSVG = d3.select("svg");
  newSVG.selectAll("path").remove();
  let newLegend = d3.select(".legend");
  newLegend.selectAll("li").remove();
  query = event.target.value;
  if(query === '' & s_idx !== -1) s_idx = -1; 
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
  
  if ( s_idx!==-1){
	filteredProjects = projects.filter((project) => {
    	let values = Object.values(project).join("\n").toLowerCase();
    	return values.includes(s_idx);
	})
  }
  console.log(query, s_idx)
  renderProjects(filteredProjects, projectsContainer, "h2");
  renderPieChart(filteredProjects);
});

renderProjects(projects, projectsContainer, "h2");
