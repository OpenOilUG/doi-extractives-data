---
# Jekyll front matter lives here.
---
/**
 * Utilities for setting or removing tabindex on all focusable elements
 * in a parent div. Useful for hiding elements off-canvas without setting
 * display:none, while still removing from the tab order
 */
var accessibility = {
  removeTabindex: function removeTabindex($elm) {
    $elm
      .find('a, button, :input, [tabindex]')
      .attr('tabindex', '-1');
  },
  restoreTabindex: function restoreTabindex($elm) {
    $elm
      .find('a, button, :input, [tabindex]')
      .attr('tabindex', '0');
  }
};

var KEYCODE_ESC = 27;

var defaultSelectors = {
  body: '#glossary',
  toggle: '.js-glossary-toggle',
  term: '.term',
  accordionButton: '.accordion__button',
  navToggle: '[data-toggler="nav-drawer"]',
  navDrawer: '#nav-drawer'
};

/**
 * Glossary widget
 * @constructor
 * @param {Array} terms - Term objects with
 * "glossary-term" and "glossary-definition" keys
 * @param {Object} selectors - CSS selectors for glossary components
 */
function Glossary(selectors) {
  var self = this;

  self.selectors = _.extend({}, defaultSelectors, selectors);

  self.$body = $(self.selectors.body);
  self.$toggle = $(self.selectors.toggle);
  self.$search = this.$body.find('.glossary__search');
  self.$accordionButton = $(self.selectors.accordionButton);
  self.$navToggle =  document.querySelector(self.selectors.navToggle);
  self.$navDrawer = $(self.selectors.navDrawer);

  // Initialize state
  self.isOpen = false;

  // Update DOM
  self.connectList();
  self.linkTerms();

  // Remove tabindices
  accessibility.removeTabindex(self.$body);

  // Bind listeners
  self.$toggle.on('click', this.toggle.bind(this));
  self.$body.on('click', '.toggle', this.toggle.bind(this));
  self.$search.on('input', this.handleInput.bind(this));
  $(document.body).on('keyup', this.handleKeyup.bind(this));
  self.$accordionButton.on('click', this.toggleAccordion.bind(this));
}
//
/** Create list.js for list staticly generated by jekyll */
Glossary.prototype.connectList = function() {
  var options = {
    valueNames: ['glossary-term'],
    listClass: 'glossary__list',
    searchClass: 'glossary__search'
  };
  this.list = new List('glossary', options);
};

/** Add links to terms in body */
Glossary.prototype.linkTerms = function() {
  var self = this;
  var $terms = $(self.selectors.term);
  $terms.each(function(){
    var $term = $(this);
    $term.attr('title', 'Click to define')
      .attr('tabindex', 0)
      .data('term', $term.data('term').toLowerCase());
  });
  $terms.on('click keypress', function(e) {
    if (e.which === 13 || e.type === 'click') {
      self.show();
      self.findTerm($(this).data('term'));
    }
  });
};

/** Highlight a term */
Glossary.prototype.findTerm = function(term) {
  this.$search.val(term);

  // Highlight the term and remove other highlights
  this.$body.find('.term--highlight').removeClass('term--highlight');
  this.$body.find('span[data-term="' + term + '"]').addClass('term--highlight');
  this.list.filter(function(item) {
    return item._values['glossary-term'].toLowerCase() === term;
  });

  // Hack: Expand text for selected item
  this.list.search();
  _.each(this.list.visibleItems, function(item) {
    var $elm = $(item.elm).find('div');
      $elm.find('.accordion__button').click();
  });
};

Glossary.prototype.toggle = function() {
  var method = this.isOpen ? this.hide : this.show;
  method.apply(this);

};

Glossary.prototype.show = function() {
  this.$body.addClass('is-open').attr('aria-hidden', 'false');
  this.$toggle.addClass('active');
  this.$search.focus();
  this.isOpen = true;
  accessibility.restoreTabindex(this.$body);
};

Glossary.prototype.hide = function() {
  this.$body.removeClass('is-open').attr('aria-hidden', 'true');
  this.$toggle.removeClass('active');
  this.isOpen = false;
  accessibility.removeTabindex(this.$body);

  if (this.$navDrawer.attr('aria-hidden') == 'false') {
    this.$navToggle.click();
  }
};

/** Remove existing filters on input */
Glossary.prototype.handleInput = function() {
  if (this.list.filtered) {
    this.list.filter();
  }
};

/** Close glossary on escape keypress */
Glossary.prototype.handleKeyup = function(e) {
  if (e.keyCode == KEYCODE_ESC) {
    if (this.isOpen) {
      this.hide();
    }
  }
};

/** Toggles the state of an accordian nav item */
Glossary.prototype.toggleAccordion = function(e) {
  var $thisButton = $(e.currentTarget);
  var $thisHeader = $(e.currentTarget.offsetParent);
  var $thisDefinition = $($thisHeader.siblings()[0]);

  // toggleClass is more concise, but this couples the button text
  // and hide/show logic
  if ($thisDefinition.hasClass('hidden')){
      $thisButton.find('i').removeClass('fa-chevron-down')
        .addClass('fa-chevron-up');
      $thisDefinition.removeClass('hidden');
  } else {
      $thisButton.find('i').removeClass('fa-chevron-up')
        .addClass('fa-chevron-down');
      $thisDefinition.addClass('hidden');
  }
};

var glossary = new Glossary({body: '#glossary'});
