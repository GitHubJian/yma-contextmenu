<template></template>

<script>
import '../../../../src/index.scss';
import bindContextMenu from '../../../../src';

export default {
    data() {
        return {};
    },
    mounted() {
        bindContextMenu(document.body, [
            {
                label: '前进',
                command: function () {
                    console.log('前进');
                },
                keymap: 'ctrl+z',
            },
        ]);
    },
};
</script>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
}
</style>
