var bus = new Vue();//用於事件傳遞)
var temp = ''
var sidebar = new Vue({
  el: "#sidebar",
  data: {
    styleObject: {
      position: 'fixed',
      display: 'flex',
      height: '100vh',
      width: '250px',
      padding: '0',
    },

    styleimg: {
      width: '10rem',
      display: '',
    },
    L1: ["編輯資料", "錄音"],
    L2: ["論壇", "好友", "聊天", "抽卡"],
    L3: ["說明"],
    photo: 'https://goo.gl/eKdiuU',
    name: ''


  },
  methods: {
    response: function () {
      if (window.innerWidth > 768) {
        this.styleObject.position = 'fixed'
        this.styleObject.display = 'flex'
        this.styleObject.height = '100vh'
        this.styleObject.width = '250px'
        this.styleObject.padding = '0'

        this.styleimg.display = 'flex'
      } else {
        this.styleObject.position = ''
        this.styleObject.display = ''
        this.styleObject.height = ''
        this.styleObject.width = ''
        this.styleObject.padding = ''

        this.styleimg.display = 'none'
      }
    },
    show: function (i) {
      $('#navbarNav').collapse('hide');
      bus.$emit('PageChange', i);

    },
    updateProfile: function () {
      let self = this;
      $.ajax({
        method: 'POST',
        url: './getProfile',
        success: function (data) {
          if (data.photo !== null) {
            self.photo = data.photo;
          }
          self.name = data.name;
        },
      });
    }
  },
  created() {
    this.updateProfile();
    //    let self = this;
    //    bus.$on('updatePhoto', function() {
    //        self.updatePhoto();
    //    });
  }
})
var mainPage = new Vue({
  el: "#mainPage",
  data: {
    Pageshown: "",
    styleObject: {
      margin: '',
    }

  },
  methods: {
    response: function () {
      if (window.innerWidth > 768) {
        this.styleObject.margin = '0px 0px 0px 250px'
      } else {
        this.styleObject = ''
      }
    }
  },
  created: function () {
    var a = this;
    a.Pageshown = "說明";
    bus.$on('PageChange', function (i) {
      a.Pageshown = i;
    })
  }
})

window.addEventListener("load", () => {
  sidebar.response();
  mainPage.response();
})
function responsive() {
  sidebar.response();
  mainPage.response();
}

