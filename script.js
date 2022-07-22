const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'HUYNHANH_NG';

const dashboard = $('.dashboard');
const playlistBtn = $('.playlist-icon');
const playlist = $('.playlist');
const cd = $('.cd');
const header = $('.heading');
const songNameHeader = $('.heading h1');
const authorNameHeader = $('.heading h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const togglePlayBtn = $('.btn-toggle-play');
const playerApp = $('.player');
const progressBar = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    configs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Thiếp là một tình lang',
            singer: 'Châu Lâm Phong',
            path: 'assets/songs/song-1.mp3',
            image: 'assets/song-bg/img-1.jpg'
        },
        {
            name: 'Vãn phong tác tửu',
            singer: 'Châu Lâm Phong',
            path: 'assets/songs/song-2.mp3',
            image: 'assets/song-bg/img-2.jpg'
        },
        {
            name: 'Vực trong gương',
            singer: 'Châu Lâm Phong',
            path: 'assets/songs/song-3.mp3',
            image: 'assets/song-bg/img-3.jpg'
        },
        {
            name: 'Linh lạc',
            singer: 'Khánh Khánh',
            path: 'assets/songs/song-4.mp3',
            image: 'assets/song-bg/img-4.jpg'
        },
        {
            name: 'Đông miên',
            singer: 'Tư Nam',
            path: 'assets/songs/song-5.mp3',
            image: 'assets/song-bg/img-5.jpg'
        }
    ],
    setConfigs: function (key, value) {
        this.configs[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.configs));
    },
    definedProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    render: function () {
        //Render songs

        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="song-icon">
                    <img class='playing-icon ${index === this.currentIndex ? 'show' : ''}' src="./assets/imgs/sound.png" alt="">
                    <img class='option-icon' src="./assets/imgs/menu.png" alt="">
                </div>
            </div>
            `
        });

        playlist.innerHTML = htmls.join('\n')
        this.songDisplay();
    },

    handleEvents: function () {

        const _this = this;

        const cdThumsRotate = cdThumb.animate([
            { transform: 'rotate(360deg)' },
        ],
            {
                duration: 8000,
                iterations: Infinity
            });

        cdThumsRotate.pause();

        // Show/Hidden the playlist
        playlistBtn.onclick = function () {
            isDisplayed = playlist.style.display !== 'none';
            if (!isDisplayed) {
                cd.style.width = '100px';
                header.style.marginTop = '20px';
                playlist.style.animation = 'fadeIn 0.2s linear';
                playlist.style.display = 'block';
            }
            else {
                cd.style.width = '300px';
                header.style.marginTop = '100px';
                playlist.style.animation = 'fadeOut 0.2s linear';
                setTimeout(function () {
                    playlist.style.display = 'none';
                }, 100);

            }
        }

        //Play audio
        togglePlayBtn.onclick = function () {
            if (!_this.isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        }

        // Khi audio phat
        audio.onplay = function () {
            _this.isPlaying = true;
            cdThumsRotate.play();
            playerApp.classList.remove('pausing');
            playerApp.classList.add('playing');
        }
        //Khi audio dung
        audio.onpause = function () {
            _this.isPlaying = false;
            cdThumsRotate.pause();
            playerApp.classList.remove('playing');
            playerApp.classList.add('pausing');
        }

        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            }
            else {
                nextBtn.click();
            }
        }

        //update progress bar
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const currentProgress = audio.currentTime / audio.duration * 100;
                progressBar.value = currentProgress;
            }
        }

        progressBar.onchange = function (e) {
            const timeUpdate = e.target.value / 100 * audio.duration;
            audio.currentTime = timeUpdate;
        }


        //Next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.songDisplay();
            _this.render();
            _this.scrollToActive();
        }
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.previousSong();
            }
            audio.play();
            _this.songDisplay();
            _this.render();
            _this.scrollToActive();
        }

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfigs('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfigs('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        //Lang nghe su kien click vao playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option-icon')) {
                //Xu ly event khi click len bai hat
                if (songNode && !e.target.closest('.option-icon')) {
                    targetIndex = Number(songNode.dataset.index);
                    _this.currentIndex = targetIndex;
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                //Xu ly event click len option icon
            }
        }
    },

    songDisplay: function () {
        const allSong = $$('.playing-icon');
        for (var i = 0; i < this.songs.length; ++i) {
            const iconAnimate = allSong[i].animate([
                { transform: 'translateY(2px)' },
                { transform: 'translateY(-2px)' }
            ],
                {
                    duration: 300,
                    iterations: Infinity
                });
        }
    },

    loadCurrentSong: function () {
        songNameHeader.textContent = this.currentSong.name;
        authorNameHeader.textContent = this.currentSong.singer;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfigs: function () {
        this.isRandom = this.configs.isRandom;
        this.isRepeat = this.configs.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    previousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActive: function () {
        setTimeout(function () {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 100);
    },

    start: function () {
        //gan cau hinh tu configs vao app
        this.loadConfigs();
        //Dinh nghia cac thuoc tinh cho object
        this.definedProperties();
        //Lang nghe/xu ly cac su kien
        this.handleEvents();
        //Tai bai hat dau tien
        this.loadCurrentSong();
        //render playlist
        this.render();

        //reset ve trang thai ban dau
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();