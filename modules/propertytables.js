import * as projects from "./projects.js";
import * as components from "./components.js";
import * as ui from "./ui.js";

components.css(`
    mixpipe-properties {
        ${components.styleMixins.GROW}
        overflow: auto;
    }

    mixpipe-properties td:first-of-type {
        min-width: 8rem;
        vertical-align: top;
    }

    mixpipe-properties input {
        width: 100%;
        min-width: 8rem;
    }
`);

function labelledInput(labelText, input, minWidth = "4rem") {
    input.element.id ||= projects.generateKey();
    input.element.style.minWidth = "6rem";

    return components.element("div", [
        components.style("display", "flex"),
        components.style("align-items", "center"),
        components.style("gap", "0.2rem"),
        components.element("label", [
            components.attribute("for", input.element.id),
            components.style("padding-inline-start", "0.5rem"),
            components.style("min-width", minWidth),
            components.text(labelText)
        ]),
        input.element
    ]);
}

export class Property {
    constructor(name, type = "string", displayName = name, options = {}) {
        this.name = name;
        this.type = type;
        this.displayName = displayName;
        this.options = options;
    }

    generateInputElementForModel(model) {
        var thisScope = this;

        if (!model.hasOwnProperty(this.name)) {
            return components.element("span", [
                components.style("display", "inline-block"),
                components.style("width", "100%"),
                components.style("text-align", "center"),
                components.text("--")
            ]);
        }

        switch (this.type) {
            case "string":
            case "number":
                var currentValue = model[this.name];

                if (this.type == "number" && this.options.roundNumber) {
                    currentValue = Math.round(currentValue);
                }

                var input = new ui.Input("", {"string": "text", "number": "number"}[this.type], currentValue);

                input.element.addEventListener("focus", () => input.element.select());

                input.events.valueChanged.connect(function(event) {
                    if (thisScope.type == "number") {
                        model[thisScope.name] = Number(event.value);

                        return;
                    }

                    model[thisScope.name] = event.value;
                });

                return input.element;

            default:
                return components.text("(Unknown)");
        }

    }
}

export class PropertyRow extends components.Component {
    constructor(property, models) {
        super("tr");

        this.element.append(
            components.element("td", [
                components.text(property.displayName)
            ])
        );

        for (var model of models) {
            this.element.append(components.element("td", [
                property.generateInputElementForModel(model)
            ]));
        }
    }
}

export class PropertyTable extends components.Component {
    constructor(models, properties) {
        super("table");

        for (var property of properties) {
            var atLeastOneModelHasProperty = false;

            for (var model of models) {
                console.log(model, property.name);
                if (model.hasOwnProperty(property.name)) {
                    atLeastOneModelHasProperty = true;

                    break;
                }
            }

            if (!atLeastOneModelHasProperty) {
                continue;
            }

            this.add(new PropertyRow(property, models));
        }
    }
}

export class PropertyTableContainer extends components.Component {
    constructor(models, properties) {
        super("mixpipe-properties");

        this.table = new PropertyTable(models, properties);

        this.add(this.table);
    }
}