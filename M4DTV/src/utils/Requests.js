import {
    TMDB_API_KEY,
    M4D_API_URL
} from "../../Secrets"
import { retrieveUser } from "./Storage";



export const getMovie = async (movie_id) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${TMDB_API_KEY}&append_to_response=videos,images&include_image_language=en,null`)
    const jsondata = await req.json();

    const reqAvailable = await fetch(`${M4D_API_URL}/movie?tmdbId=${movie_id}&id=${user_id}`)
    const availablejsondata = await reqAvailable.json();

    const reqWatchlist = await fetch(`${M4D_API_URL}/watchlist?id=${user_id}&tmdbId=${movie_id}`)
    const watchlistjsondata = await reqWatchlist.json()

    jsondata.inWatchlist = watchlistjsondata.isInWatchlist

    jsondata.available = availablejsondata.available

    return jsondata
}

export const getShow = async (show_id) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`https://api.themoviedb.org/3/tv/${show_id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids,videos,images&include_image_language=en,null`)
    const jsondata = await req.json();

    const tvdb = jsondata.external_ids.tvdb_id

    const reqTvdb = await fetch(`https://skyhook.sonarr.tv/v1/tvdb/shows/en/${tvdb}`);
    const tvdbjsondata = await reqTvdb.json();

    const reqSonarr = await fetch(`${M4D_API_URL}/show?tvdbId=${tvdb}&id=${user_id}`)
    const sonarrjsondata = await reqSonarr.json();


    const reqWatchlist = await fetch(`${M4D_API_URL}/watchlist?id=${user_id}&tmdbId=${show_id}&isShow=true`)
    const watchlistjsondata = await reqWatchlist.json()

    const ep_constructor = (value, index, array) => {
        value.tmdb_id = jsondata.id
        value.tvdb_id = tvdb
    }

    sonarrjsondata.episodes.forEach(ep_constructor)
    const final_data = {
        tmdb_id: jsondata.id,
        tvdb_id: tvdb,
        genres: jsondata.genres,
        first_air_date: jsondata.first_air_date,
        name: jsondata.name,
        poster_path: jsondata.poster_path,
        backdrop_path: jsondata.backdrop_path,
        vote_average: jsondata.vote_average,
        seasons: sonarrjsondata.seasons,
        episodes: sonarrjsondata.episodes,
        logo: jsondata.images.logos.length > 0 ? jsondata.images.logos[0].file_path : null,
        runtime: jsondata.episode_run_time[0],
        overview: jsondata.overview,
        inWatchlist: watchlistjsondata.isInWatchlist
    }

    return final_data
}

export const getTrending = async (page = 1) => {
    const req = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}&page=${page}`)
    const jsondata = await req.json()
    return jsondata
}

export const getGenreMovies = async (genre, page = 1) => {
    const req = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=true&page=${page}&with_genres=${genre}&with_watch_monetization_types=flatrate`)
    const jsondata = await req.json()
    return jsondata
}

export const getGenreShows = async (genre, page = 1) => {
    const req = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=true&page=${page}&with_genres=${genre}&with_watch_monetization_types=flatrate`)
    const jsondata = await req.json()
    return jsondata
}

export const getStreamMovie = async (tmdb_id) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/key?media_type=movie&tmdbId=${tmdb_id}&id=${user_id}`, { method: "POST" })
    const jsondata = await req.json()
    return jsondata
}

export const getStreamTV = async (tvdb_id, season, episode) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/key?media_type=tv&tvdbId=${tvdb_id}&id=${user_id}&season=${season}&episode=${episode}`, { method: "POST" })
    const jsondata = await req.json()
    return jsondata
}

export const getGenresMovies = async () => {
    const req = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`)
    const jsondata = await req.json()
    return jsondata
}

export const getGenresShows = async () => {
    const req = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`)
    const jsondata = await req.json()
    return jsondata
}

export const getSearchResults = async (query, page = 1) => {
    const req = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&include_adult=true&query=${query}&page=${page}`)
    const jsondata = await req.json()
    return jsondata
}

export const login = async (pincode) => {
    const req = await fetch(`${M4D_API_URL}/connect?pincode=${pincode}`, { method: "POST" })
    const jsondata = await req.json()
    return jsondata
}

export const getUser = async () => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/user?userId=${user_id}`)
    const jsondata = await req.json()
    return jsondata
}

export const getWatchlist = async () => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/watchlist?id=${user_id}`)
    const initialJSON = await req.json()
    const final = []
    initialJSON.forEach(element => {
        if (element.media_type === "tv") {
            final.push({
                media_type: element.media_type,
                id: element.id,
                first_air_date: element.release_date,
                name: element.title,
                backdrop_path: element.image.src,
                vote_average: element.rating,
            })
        }
        else {
            final.push({
                media_type: element.media_type,
                id: element.id,
                release_date: element.release_date,
                title: element.title,
                backdrop_path: element.image.src,
                vote_average: element.rating,
            })
        }
    });
    return final;
}

export const addWatchlist = async (tmdb_id, isShow) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/watchlist?id=${user_id}&isShow=${isShow}&tmdbId=${tmdb_id}`, { method: "POST" })
    const jsondata = await req.json()

    return jsondata
}

export const deleteWatchlist = async (tmdb_id, isShow) => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/watchlist?id=${user_id}&isShow=${isShow}&tmdbId=${tmdb_id}`, { method: "DELETE" })
    const jsondata = await req.json()

    return jsondata
}

export const getHistory = async () => {
    const user_id = await retrieveUser("user_id")
    const req = await fetch(`${M4D_API_URL}/history?id=${user_id}`)
    const initialJSON = await req.json()
    const final = []
    initialJSON.history.forEach(element => {
        if (element.media_type === "tv") {
            final.push({
                media_type: element.media_type,
                tvdb_id: element.tvdbId,
                id: element.id,
                first_air_date: element.release_date,
                name: element.title,
                backdrop_path: element.image.src,
                vote_average: element.rating,
                percentage: element.percentage
            })
        }
        else {
            final.push({
                media_type: element.media_type,
                id: element.id,
                release_date: element.release_date,
                title: element.title,
                backdrop_path: element.image.src,
                vote_average: element.rating,
                percentage: element.percentage
            })
        }
    });

    return final;
}

export const addHistory = async (tvdb_id = 0, tmdb_id = 0, season = 0, episode = 0, percentage) => {
    const user_id = await retrieveUser("user_id")
    const media_type = tvdb_id === 0 ? "movie" : "tv"

    const req = await fetch(
        `${M4D_API_URL}/history?id=${user_id}&tmdbId=${tmdb_id}&tvdbId=${tvdb_id}&season=${season}&episode=${episode}&media_type=${media_type}&percentage=${percentage}`,
        { method: "POST" }
    )
    const res = await req.json()

    return res;
}

export const getSingleHistory = async (tvdb_id = 0, tmdb_id = 0, season = 0, episode = 0) => {
    const user_id = await retrieveUser("user_id")
    const media_type = tvdb_id === 0 ? "movie" : "tv"

    const req = await fetch(
        `${M4D_API_URL}/history?id=${user_id}&tmdbId=${tmdb_id}&tvdbId=${tvdb_id}&season=${season}&episode=${episode}&media_type=${media_type}&one=true`)
    const res = await req.json();

    return res;
}