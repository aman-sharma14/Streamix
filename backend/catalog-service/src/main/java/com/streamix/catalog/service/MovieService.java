@Service
public class MovieService {
    @Autowired
    private MovieRepository repository;

    private final String TMDB_API_KEY = "YOUR_API_KEY_HERE";
    private final String TMDB_URL = "https://api.themoviedb.org/3/movie/popular?api_key=" + TMDB_API_KEY;

    public void syncMoviesFromTMDB() {
        RestTemplate restTemplate = new RestTemplate();
        TmdbResponse response = restTemplate.getForObject(TMDB_URL, TmdbResponse.class);

        if (response != null && response.getResults() != null) {
            for (TmdbMovieDto dto : response.getResults()) {
                // Only add if it doesn't already exist
                if (repository.findByTitle(dto.getTitle()).isEmpty()) {
                    Movie movie = new Movie();
                    movie.setTitle(dto.getTitle());
                    movie.setCategory("Popular"); // You can map genre_ids to names later
                    movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + dto.getPoster_path());
                    movie.setVideoUrl("https://www.youtube.com/results?search_query=" + dto.getTitle() + "+trailer");

                    repository.save(movie);
                }
            }
        }
    }
}