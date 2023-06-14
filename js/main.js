const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      client: null,
      opts: {
        channels: [env.channel],
        options: {
          clientId: env.client_id,
          skipUpdatingEmotesets: true,
        },
        identity: {
          username: env.channel,
          password: env.oauth,
        }
      },
      broadcaster: env.channel,
      config: env,
      restart: new Date().toISOString(),
      streamEnded: false,
      text: '',
      interval: undefined,
    };
  },
  async mounted() {
    this.startTimer(300);
    this.client = new tmi.client(this.opts);
    this.client.on("message", this.onMessageHandler);
    this.client.on("connected", this.onConnectedHandler);
    this.client.connect();
  },
  methods: {
    onConnectedHandler(addr, port) {
      console.log(`* Connected to ${addr}:${port}`);
    },
    onMessageHandler(target, context, msg, self) {
      if (context.username !== this.broadcaster) {
        if (!this.streamEnded) {
          this.restart = new Date().toISOString();
          clearInterval(this.interval)
          this.startTimer(300);
        }
      }
    },
    startTimer(duration) {
      const vm = this;
      var timer = duration, minutes, seconds;
      vm.interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        seconds = seconds < 10 ? "0" + seconds : seconds;

        vm.text = minutes + ":" + seconds;

        if (--timer < 0) {
          clearInterval(vm.interval);
          vm.text = 'Stream Ended!!!'
        }
      }, 1000);
    },
    finished() {
      this.streamEnded = true;
      this.client.say(this.broadcaster, 'There has been no activity for 5 minutes so stream is ending!!!')
    },
    isBroadcaster(context) {
      return context.username === this.broadcaster;
    },
  },
});

app.mount("#app");
