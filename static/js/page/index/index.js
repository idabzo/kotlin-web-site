import $ from 'jquery';
import initJScroll from './jquery.jscroll';
import './index.scss';
import './wh.theme.scss';

const initJQTabs = function () {
    const $tabsEl = $('.kjq-tabs');
    const $tabs = $tabsEl.find('.kjq-tabs-tab');

    const $tabsWrapper = $('<ul class="kjq-tabs-tab__tabs"></ul>')

    const $tabLinks = $tabs.map(function(i, el) {
        const $el = $(el);
        const isActive = i === 0;
        const title = $el.find('.kjq-tabs-tab__title').detach().text();

        const $item = $('<li class="kjq-tabs-tab__tabs-item">')
            .toggleClass('kjq-tabs-tab__tabs-item_active', isActive)
            .text(title);

        $el.toggleClass('kjq-tabs-tab_inactive', !isActive);
        $tabsWrapper.append($item);

        return $item;
    });

    $tabsEl.prepend($tabsWrapper);
    $tabsEl.addClass('kjq-tabs_inited');

    $tabsWrapper.on('click', '.kjq-tabs-tab__tabs-item', function(e) {
        const $target = $(e.target);
        const index = $target.index();

        scrollTabToCenter($tabsWrapper, $target);

        $tabs.each(function(i, el) {
            const $el = $(this);
            $el.toggleClass('kjq-tabs-tab_inactive', $el.index() !== index);

            if ($el.index() === index) {
                $el.find('[data-kotlin-playground-initialized]').each(function(i, playground) {
                    playground.KotlinPlayground.view.codemirror.refresh();
                });
            }
        });

        $tabLinks.each(function(i, el) {
            const $el = $(this);
            $el.toggleClass('kjq-tabs-tab__tabs-item_active', $el.index() === index);
        });
    });

    $('.kjq-tabs-tab__tabs').jScroll();
}

function scrollTabToCenter($container, $currentTab) {
    const containerLeft =  $container.scrollLeft();
    const containerWidth = $container.width() / 2;
    const tabLeft = $currentTab.position().left;
    const tabWidth = $currentTab.width() / 2;

    $container.animate({ scrollLeft: containerLeft + tabLeft - containerWidth + tabWidth }, 500);
}

const initTabs = function () {
    const $tabWrapper = $('.overview-group');
    $tabWrapper.jScroll();

    const $tabs = $('.js-tab');

    $tabs.on('click', function () {
        const $tab = $(this),
            tabId = $tab.attr('data-tab-id');
        if ($tab.hasClass('is_active')) {
            return;
        }

        $tabs.each(function () {
            const $currentTab = $(this),
                currentTabId = $currentTab.attr('data-tab-id'),
                $tabContentNode = $('#' + currentTabId);

            if (tabId === currentTabId) {
                $currentTab.addClass('is_active');
                $tabContentNode.removeClass('is_hidden');
                scrollTabToCenter($tabWrapper, $currentTab)
            } else {
                $currentTab.removeClass('is_active');
                $tabContentNode.addClass('is_hidden');
            }
        });

        $tabs.trigger('tabs-change', tabId)
    });
};

const initPopups = function () {
    const popups =
        {
            init: function () {
                const that = this,
                    $popups = $('.js-popup'),
                    $popupShowButtons = $('.js-popup-open-button'),
                    $popupHideButtons = $('.js-popup-close-button');

                $popupShowButtons.on('click', function (e) {
                    const popupId = this.getAttribute('data-popup-id');

                    e.preventDefault();
                    e.stopPropagation();
                    that.showPopup(popupId);
                });

                $popupHideButtons.on('click', function (e) {
                    const popupId = this.getAttribute('data-popup-id');

                    e.stopPropagation();
                    that.hidePopup(popupId);
                });

                $(document.body).on('click', function () {
                    $popups.each(function () {
                        const $popup = $(this),
                            popupId = this.id;

                        if (!$popup.hasClass('_hidden')) {
                            that.hidePopup(popupId);
                        }
                    });
                });

                $popups.on('click', '.popup-content', function (e) {
                    e.stopPropagation();
                })
            },

            showPopup: function (id) {
                const $popupNode = $('#' + id);

                $popupNode.removeClass('_hidden');
            },

            hidePopup: function (id) {
                const $popupNode = $('#' + id);

                $popupNode.addClass('_hidden');

                if ($popupNode[0].hasAttribute('data-popup-hide-reinit')) {
                    const html = $popupNode.html();
                    $popupNode.html(html);
                }
            }
        };

    popups.init();
};

const initAnchors = function () {
    $('.smooth-anchor').on('click', function (e) {
        const id = (e.target.getAttribute('href') || '').substring(1);
        if (id) {
            const el = $('#' + id)[0];
            if (el) {
                e.preventDefault();
                el.scrollIntoView({behavior: 'smooth'});
            }
        }
    })
};

function queryPlayground(selector) {
    const instanceNode = $(selector)[0];
    return instanceNode && instanceNode.KotlinPlayground && instanceNode.KotlinPlayground.view;
}

const SCROLL_OPTIONS = {
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest'
};

function initTabsRunButton() {
    $('.js-tab').on('tabs-change', function(e, tabId) {
        const instance = queryPlayground(`#${tabId} > .sample`);

        $(`.kotlin-code-examples-section__run`)
            .toggleClass('kotlin-code-examples-section__run_hide', Boolean(instance.state.highlightOnly));
    });

    $('.kotlin-code-examples-section__run').on('click', function () {
        const $node = $(`.kotlin-overview-code-example:not(.is_hidden) > .sample`);
        const instance = queryPlayground($node);

        $node.one('kotlinPlaygroundRun', function() {
            const output = $node.next().find('.output-wrapper')[0];

            if (output.getBoundingClientRect().bottom > window.innerHeight) {
                output.scrollIntoView(SCROLL_OPTIONS);
            }
        });

        if (instance) instance.execute();
    });
}

$(function () {
    initJScroll($);
    initPopups();
    initTabs();
    initJQTabs();
    initAnchors();
    initTabsRunButton()
});
