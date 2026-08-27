<template>
  <div>
    <main id="main">
      <section class="sec-md pt0">
        <div class="container">
          <!-- <p class="fwb">今期 {{now_season[0]}} {{now_season[1]}}アニメ</p> -->
        </div>
        <div class="container-fluid">
          <div class="item-list mtxxs">
            <!-- {{json_data}} -->
          </div>
        </div>
      </section>
      <!-- <Archive /> -->
      <!-- <section id="about" class="sec-md pt0">
        <div class="container">
          <h2 class="fwb">🍬 このサイトについて</h2>
          <p>今期アニメのオープニング、エンディングで使われているアニソンをYoutubeの再生回数順に順に見れるサイトです。</p>
          <p>Youtubeのリンクは公式チャンネルでアップロードされている動画のみを使用しています。</p>
        </div>
      </section> -->
    </main>
  </div>
</template>






<script>
  import Header from '~/components/Header.vue'
  import Footer from '~/components/Footer.vue'

  // json
  // import json_data from '~/data/v_music.json'

import axios from 'axios'

  let url = 'https://api.twitch.tv/kraken/users?login=yamatonjp,fps_shaka';

  export default {
    head() {
      return {
        title: '今期',
        titleTemplate: '%sアニメ主題歌Youtubeランキング｜OP・EDまとめ',
        aaa: []
      }
    },
    data: function(){
      return {
        // json_data: 'aaa'
        // json_aaa: this.$parent.json_data,
      };
    },
    components: {
      Header,
      Footer,
    },
    async asyncData() {
      let users = await axios.get(
        url,
        {
          headers: {
            "Accept": 'application/vnd.twitchtv.v5+json',
            "Client-ID": 'o6zwl369stt4062fod8ft7x3j2rchx'
             }
        }
        );
      console.log(users.data.users);

      // var streams = users.data.users.filter(function(item, index){
      //     console.log(item._id);

      //    return 'aaa';
      // });
      var sum = [];
      var streams = [];
      for(var i=0; i < users.data.users.length; i++){
        var aaa = {
          user: [],
          stream: []
        };
        streams = await axios.get(
          'https://api.twitch.tv/kraken/streams/'+users.data.users[i]._id,
          { headers: { "Accept": 'application/vnd.twitchtv.v5+json', "Client-ID": 'o6zwl369stt4062fod8ft7x3j2rchx' } }
          );
        aaa.user = users.data.users[i];
        aaa.stream = streams.data.stream;
        sum.push(aaa);
      }
      console.log(sum);

      return{ json_data: sum };
    },
    created() {
      // console.log(this.json_data);

      // console.log(json_data);

      // // シーズン名を日本語に変換
      // let now_season = "";
      // switch (true){
      //   case /spring/.test(this.param):
      //     now_season = this.param.replace('spring', '春');
      //     break;
      //   case /summer/.test(this.param):
      //     now_season = this.param.replace('summer', '夏');
      //     break;
      //   case /autumn/.test(this.param):
      //     now_season = this.param.replace('autumn', '秋');
      //     break;
      //   case /winter/.test(this.param):
      //     now_season = this.param.replace('winter', '冬');
      //     break;
      // }

      // //シーズン名を変数化
      // this.now_season = now_season.split('-');
      // // console.log(this);

      // // アニメデータからシーズンに絞る
      // var param = this.param.replace('-', ' ');
      // var json_data = this.json_data;
      // // var json_anime = this.json_anime;

      // // アニメデータからシーズンに絞る
      // var json_anime_after = json_data.filter(function(item, index){
      //   if (item.music_season == param) return true;
      // });

      // json_anime_after.sort(function (a, b) {
      //   if (Number(a.music_view_count_number) < Number(b.music_view_count_number)) return 1;
      //   if (Number(a.music_view_count_number) > Number(b.music_view_count_number)) return -1;
      //   // a must be equal to b
      //   return 0;
      // });
      // this.json_data = json_anime_after;
      // // console.log(this.json_data );

    },
  };
</script>
