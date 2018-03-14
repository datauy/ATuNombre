export default function(class_name) {
/**
     * Clearable text inputs
     */

$(document)
    .on('input', class_name, function() {
        $(this)[toggle(this.value)]('x');
    })
    .on('mousemove', '.x', function(e) {
        $(this)[toggle(this.offsetWidth - 38 < e.clientX - this.getBoundingClientRect().left)]('onX');
    })
    .on('touchstart click', '.onX', function(ev) {
        ev.preventDefault();
        $(this)
            .removeClass('x onX')
            .val('')
            .change();
    });
}

function toggle(v) {
    return v ? 'addClass' : 'removeClass';
};
