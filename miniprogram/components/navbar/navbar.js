Component({
  properties: {
    title: {
      type: String,
      value: '全部'
    },
    showPicker: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onArrowTap() {
      this.triggerEvent('arrowTap')
    }
  }
})