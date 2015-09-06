import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Pretender from 'pretender';
import faker from 'faker';

var App, server;

module('Acceptance: Infinity Route - offset trigger', {
  setup() {
    var posts = [];

    for (var i = 0; i < 50; i++) {
      posts.push({id: i, name: faker.company.companyName()});
    }

    App = startApp();
    server = new Pretender(function() {
      this.get('/posts', function(request) {
        var body, subset, perPage, startPage, offset;

        if (request.queryParams.category) {
          subset = posts.filter(post => {
            return post.category === request.queryParams.category;
          });
        } else {
          subset = posts;
        }
        perPage = parseInt(request.queryParams.per_page, 10);
        startPage = parseInt(request.queryParams.page, 10);

        var pageCount = Math.ceil(subset.length / perPage);
        offset = perPage * (startPage - 1);
        subset = subset.slice(offset, offset + perPage);

        body = { posts: subset, meta: { total_pages: pageCount } };

        return [200, {"Content-Type": "application/json"}, JSON.stringify(body)];
      });
    });
  },
  teardown() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});


test('it should start loading more items when the scroll is on the very bottom ' +
  'when triggerOffset is not set', assert => {
  visit('/test-scrollable');

  andThen(() => {
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postList.find('li').length, 25, "Two items should be in the list");
    assert.equal(infinityLoader.hasClass('reached-infinity'), false, "Infinity should not yet have been reached");
    var triggerOffset = postList.get(0).scrollHeight - postList.height();
    postList.scrollTop(triggerOffset - 20);
    triggerEvent('ul', 'scroll');
    andThen(() => {
      assert.equal(postList.scrollTop(), triggerOffset - 20, "Window should be scrolled");
      assert.equal(postList.find('li').length, 25, "25 items should be in the list");
      assert.equal(find('span').text(), 'loading');
      postList.scrollTop(triggerOffset + 20);
      triggerEvent('ul', 'scroll');

      andThen(() => {
        assert.equal(postList.scrollTop(), triggerOffset + 20, "Window should be scrolled");
        assert.equal(postList.find('li').length, 50, "50 items should be in the list");
        assert.equal(infinityLoader.hasClass('reached-infinity'), true, "Infinity should have been reached");
      });
    });
  });

test('it should start loading more items before the scroll is on the very bottom ' +
  'when triggerOffset is set', assert => {
  visit('/test-scrollable?triggerOffset=200');

  andThen(() => {
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postList.find('li').length, 25, "Two items should be in the list");
    assert.equal(infinityLoader.hasClass('reached-infinity'), false, "Infinity should not yet have been reached");
    var triggerOffset = postList.get(0).scrollHeight - postList.height() - 200;
    postList.scrollTop(triggerOffset - 20);
    triggerEvent('ul', 'scroll');
    andThen(() => {
      assert.equal(postList.scrollTop(), triggerOffset - 20, "Window should be scrolled");
      assert.equal(postList.find('li').length, 25, "25 items should be in the list");
      assert.equal(find('span').text(), 'loading');
      postList.scrollTop(triggerOffset + 20);
      triggerEvent('ul', 'scroll');

      andThen(() => {
        assert.equal(postList.scrollTop(), triggerOffset + 20, "Window should be scrolled");
        assert.equal(postList.find('li').length, 50, "50 items should be in the list");
        assert.equal(infinityLoader.hasClass('reached-infinity'), true, "Infinity should have been reached");
      });
    });
  });

});
