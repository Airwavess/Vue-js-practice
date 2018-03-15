Vue.component('loading', {
  template: `
  <div id="cube" class="sk-cube-grid">
    <div class="sk-cube sk-cube1"></div>
    <div class="sk-cube sk-cube2"></div>
    <div class="sk-cube sk-cube3"></div>
    <div class="sk-cube sk-cube4"></div>
    <div class="sk-cube sk-cube5"></div>
    <div class="sk-cube sk-cube6"></div>
    <div class="sk-cube sk-cube7"></div>
    <div class="sk-cube sk-cube8"></div>
    <div class="sk-cube sk-cube9"></div>
  </div>
  `
})
Vue.component('postbox', {
  props: ['post'],
  template: `
    <div class='postbox'>
      <div class='postbox_inner'>
        <a class='postbox_href' :href='story_url(post.id)' target='_blank'>
          <h4 v-html='post.title'></h4>
          <p v-html='post.message'></p>
        </a> 
        <p>Posted by 
          <strong><em v-html="post.author"></em></strong>
          {{ created_time(post.created_time) }}
        </p>
      </div>
    </div>`,
  methods: {
    story_url(id) {
      return "https://www.facebook.com/permalink.php?story_fbid=" + id.split('_')[1] + "&id=170659829952078"
    },

    created_time(time) {
      return time.match("[0-9]{4}-[0-9]{2}-[0-9]{2}")[0]
    },
  }
})

var app = new Vue({
  el: '#app',
  data: {
    posts: [],
    filter: "",
    status: false,
    authors: [],
    show_autocomplete: true,
    authors_autocomplete: [],
    chicked: false
  },
  mounted() {
    var self = this
    window.fbAsyncInit = function () {
      FB.init({
        appId: '864282600417014',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v2.11'
      });
      FB.AppEvents.logPageView();
      self.get_post()
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  },
  computed: {
    filtered_post() {
      return this.posts.filter((post) => {
        var field = ['title', 'message', 'author'];
        var contain_flag = false;
        field.forEach((f) => {
          if (post[f].indexOf(this.filter) != -1) {
            contain_flag = true;
          }
        });
        return contain_flag;
      }).map((post) => {
        var temp_post = JSON.parse(JSON.stringify(post))
        if (this.filter == "") {
          temp_post.message = temp_post.message.substr(0, 90) + "..."
          return temp_post
        }
        var field = ['title', 'message', 'author'];
        field.forEach((f) => {
          var regex = new RegExp(this.filter, 'i')
          var match = temp_post[f].match(regex)
          if (match)
            temp_post[f] = temp_post[f].replace(regex, "<span class='highlight'>" + match[0] + "</span>")
        })
        temp_post.message = temp_post.message.substr(0, 90) + "..."
        return temp_post;
      }).sort(function (post1, post2) {
        return ((post1.created_time > post2.created_time) ? -1 : ((post1.created_time == post2.created_time) ? 0 : 1))
      });
    },
    get_posts_by_author() {
      if (this.filter.length > 0) {
        if (this.chicked) {
          this.chicked = false
          return
        } else {
          this.show_autocomplete = true
        }
        return this.authors.filter((author) => {
          if (author.indexOf(this.filter) != -1) {
            return true
          }
        })
      }
    }
  },
  methods: {
    get_post() {
      var accessToken = "EAACEdEose0cBAGyOhXw9SmS0bay3nZBHMTLj9nz6ynThAwIfCOxa077m4fw95pjP1NzSZCmDjnITpL782lzodmH4UD3wQUTXr3z7ByOWOXpTkRhvZBKlnuSNIkXCZAq9FZAUtGpKjNPpO4OWHMXi410IyRQuaMoqD2INJ2XLsCRTZBdZCWsy49gBQjElCyPLQOaZCQmJBSQ4XwZDZD"
      FB.api(
        '/170659829952078/posts?fields=message,likes,created_time,id',
        'GET', {
          "access_token": accessToken,
          "limit": 100,
        },
        (response) => {
          this.set_post(response)
        }
      );
    },
    set_post(response) {
      response.data.forEach((item) => {
        var regex = new RegExp('【.*】')
        if (typeof (item.message) !== 'undefined') {
          var title = item.message.match(regex)
          var data = {
            'id': item.id,
            'created_time': item.created_time,
            'title': title != null ? title[0] : '【成功故事】',
            'message': (item.message.indexOf('】') != -1) ? item.message.split("】")[1] : item.message,
            'author': this.post_author(item.message),
          }
          this.$set(this.posts, this.posts.length, data)
        }
      })

      if (typeof (response.paging.next) !== 'undefined') {
        FB.api(response.paging.next, (res) => {
          this.set_post(res)
        })
      } else {
        this.status = true;
        this.get_author()
      }
    },
    post_author(message) {
      var author = ""
      if (typeof (message) === 'undefined') {
        return "劇場小編 "
      }
      var boo = false
      for (var i = message.length - 1; i >= message.length - 6; i--) {
        if (message[i] === '-' || message[i] === '—') {
          boo = true
          break;
        }
        author = message[i] + author
      }

      return (boo) ? author : "劇場小編"
    },
    get_author() {
      this.posts.forEach((post) => {
        if (this.authors.indexOf(post.author) == -1) {
          this.authors.push(post.author)
        }
      })
    },
    outside: function (e) {
      this.show_autocomplete = false
    },
    // inside: function (e) {
    // }
  },
  directives: {
    'click-outside': {
      bind: function (el, binding, vNode) {
        // Define Handler and cache it on the element
        const bubble = binding.modifiers.bubble
        const handler = (e) => {
          if (bubble || (!el.contains(e.target) && el !== e.target)) {
            binding.value(e)
          }
        }
        el.__vueClickOutside__ = handler

        // add Event Listeners
        document.addEventListener('click', handler)
      },
    }
  }
})