var Accordion = {

	config: {
		classAccordion: "js-accordion",
		classItem: "js-accordion-item",
		classButton: "js-accordion-button",
		classBody: "js-accordion-body",
		classExpanded: "expanded",
		classCollapsed: "collapsed"
	},

	init: function() {
		Accordion.toggleBodiesVisibility();
		$("body").delegate("." + Accordion.config.classButton, "click", Accordion.onClick);
	},

	onClick: function($e) {
		$e.preventDefault();
		new Accordion.Button(this).getItem().toggle();
	},

	toggleBodiesVisibility: function() {
		$("." + Accordion.config.classBody).each(function() {
			var $body = $(this);
			var $item = $body.closest("." + Accordion.config.classItem);
			if ($item.hasClass(Accordion.config.classExpanded))
				$body.slideDown();
			else if ($item.hasClass(Accordion.config.classCollapsed))
				$body.slideUp();
		});
	},

	Accordion: function Accordion(element) {
		this.$element = $(element);

		this.isSinglemode = function() {
			return this.$element.hasClass("singlemode") || this.$element.data("singlemode");
		}

		this.getExpandedItem = function() {
			var items = this.$element.find("." + window.Accordion.config.classItem).toArray();
			var depths = items.map(function(item) {
				return $(item).parents().length;
			});
			var lowestDepth = Math.min.apply(null, depths);
			for (var i in items) {
				var $curItem = $(items[i]);
				if ($curItem.parents().length === lowestDepth && $curItem.hasClass(window.Accordion.config.classExpanded))
					return new window.Accordion.Item($curItem);
			}
			return null;
		}
	},

	Item: function Item(element) {
		this.$element = $(element);

		this.getAccordion = function() {
			var $accordion = this.$element.closest("." + Accordion.config.classAccordion);
			if (!$accordion.length)
				throw new Error("There is no accordion of this item");
			return new Accordion.Accordion($accordion[0]);
		}

		this.getBody = function() {
			if (!this.body) {
				var bodies = this.$element.find("." + Accordion.config.classBody).toArray();
				if (!bodies.length)
					throw new Error("No bodies in accordion item");
				var $body = $(bodies[0]);
				for (var i = 1; i < bodies.length; i++) {
					var $tmpBody = $(bodies[i]);
					if ($tmpBody.parents().length < $body.parents().length)
						$body = $tmpBody;
				}
				this.body = new Accordion.Body($body);
			}
			return this.body;
		}

		this.toggle = function() {
			if (this.isToggling())
				return;
			this.$element.trigger("accordion:beforeToggle");
			this.getBody().$element.slideToggle();
			var accordion = this.getAccordion();
			if (accordion.isSinglemode() && !this.isExpanded()) {
				var expandedItem = accordion.getExpandedItem();
				if (expandedItem) {
					expandedItem.$element.removeClass("expanded").addClass("collapsed");
					expandedItem.getBody().$element.slideUp();
				}
			}
			this.$element.toggleClass(Accordion.config.classCollapsed + " " + Accordion.config.classExpanded);
			this.$element.trigger("accordion:afterToggle");
		}

		this.isToggling = function() {
			return this.getBody().$element.is(":animated");
		}

		this.isExpanded = function() {
			return this.$element.hasClass(Accordion.config.classExpanded);
		}
	},

	Button: function Button(element) {
		this.$element = $(element);

		this.getItem = function() {
			var $item = $(this.$element.closest("." + Accordion.config.classItem));
			if (!$item.length)
				throw new Error("There is no item of this button");
			return new Accordion.Item($item);
		}
	},

	Body: function Body(element) {
		this.$element = $(element);
	}
}
