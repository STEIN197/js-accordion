export default class Accordion {

	private static readonly config = {
		classAccordion: "js-accordion",
		classItem: "js-accordion-item",
		classButton: "js-accordion-button",
		classBody: "js-accordion-body",
		classExpanded: "expanded",
		classCollapsed: "collapsed"
	}

	private readonly $element: JQuery<HTMLElement>;

	private get isSinglemode(): boolean {
		return this.$element.hasClass("singlemode") || this.$element.data("singlemode");
	}

	public constructor(element: HTMLElement) {
		this.$element = $(element);
	}

	private getExpandedItem(): typeof Accordion.Item.prototype {
		let items = this.$element.find(`.${Accordion.config.classItem}`).toArray();
		let depths = items.map(item => $(item).parents().length);
		let lowestDepth = Math.min.apply(null, depths);
		for (let item of items) {
			let $curItem = $(item);
			if ($curItem.parents().length === lowestDepth && $curItem.hasClass(Accordion.config.classExpanded))
				return new Accordion.Item($curItem);
		}
		return null;
	}

	public static init(): void {
		this.toggleVisibility();
		$("body").delegate(`.${Accordion.config.classButton}`, "click", this.onClick);
	}

	private static onClick(this: HTMLElement, $e: any): void {
		$e.preventDefault();
		new Accordion.Button(this).getItem().toggle();
	}

	private static toggleVisibility(): void {
		$(`.${this.config.classBody}`).each(function() {
			let $body = $(this);
			let $item = $body.closest(`.${Accordion.config.classItem}`);
			if ($item.hasClass(Accordion.config.classExpanded))
				$body.slideDown();
			else if ($item.hasClass(Accordion.config.classCollapsed))
				$body.slideUp();
		});
	}

	private static Item = class Item {

		private readonly $element: JQuery<HTMLElement>;
		private body: typeof Accordion.Body.prototype;

		private get isToggling(): boolean {
			return this.getBody().$element.is(":animated");
		}

		private get isExpanded(): boolean {
			return this.$element.hasClass(Accordion.config.classExpanded);
		}

		public constructor(element: HTMLElement | JQuery<HTMLElement>) {
			this.$element = $(element);
		}

		public toggle(): void {
			if (this.isToggling)
				return;
			this.$element.trigger("accordion:beforeToggle");
			this.getBody().$element.slideToggle();
			let accordion = this.getAccordion();
			if (accordion.isSinglemode && !this.isExpanded) {
				let expandedItem = accordion.getExpandedItem();
				if (expandedItem) {
					expandedItem.$element.removeClass("expanded").addClass("collapsed");
					expandedItem.getBody().$element.slideUp();
				}
			}
			this.$element.toggleClass(Accordion.config.classCollapsed + " " + Accordion.config.classExpanded);
			this.$element.trigger("accordion:afterToggle");
		}

		private getAccordion(): Accordion {
			let $accordion = this.$element.closest(`.${Accordion.config.classAccordion}`);
			if (!$accordion.length)
				throw new Error("The item has no accordion");
			return new Accordion($accordion[0]);
		}

		private getBody(): typeof Accordion.Body.prototype {
			if (!this.body) {
				let bodies = this.$element.find(`.${Accordion.config.classBody}`).toArray();
				if (!bodies.length)
					throw new Error("The item has no body");
				let $body = $(bodies[0]);
				for (let i = 1; i < bodies.length; i++) {
					let $tmpBody = $(bodies[i]);
					if ($tmpBody.parents().length < $body.parents().length)
						$body = $tmpBody;
				}
				this.body = new Accordion.Body($body);
			}
			return this.body;
		}
	}

	private static Button = class Button {

		private readonly $element: JQuery<HTMLElement>;

		public constructor(element: HTMLElement | JQuery<HTMLElement>) {
			this.$element = $(element);
		}

		public getItem (): typeof Accordion.Item.prototype {
			let $item = $(this.$element.closest("." + Accordion.config.classItem));
			if (!$item.length)
				throw new Error("There is no item of this button");
			return new Accordion.Item($item);
		}
	}

	private static Body = class Body {

		public readonly $element: JQuery<HTMLElement>;

		public constructor(element: HTMLElement | JQuery<HTMLElement>) {
			this.$element = $(element);
		}
	}
}
