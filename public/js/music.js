var is_playing_music = true;
var audio = new Audio('../public/music/song.mp3');
var startMusic = function() {
    if (is_playing_music) {
        
        audio.volume = MUSIC_VOLUME;
        audio.play();
    }
}

var stopMusic = function() {
    audio.pause();
    is_playing_music = false;
}
var setVolume = function() {
    audio.volume = MUSIC_VOLUME;
}