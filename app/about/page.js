
export default function About() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-blue-600">
          About Our Weather App
        </h1>

        <p className="mt-5 leading-7 text-gray-600">
          Welcome to our Weather App! This application
          helps you check current weather conditions
          and hourly forecasts easily.
        </p>

        <p className="mt-4 leading-7 text-gray-600">
          You can explore temperature, local time,
          humidity, and wind speed using weather data
          provided by the Open-Meteo API.
        </p>

        <p className="mt-4 leading-7 text-gray-600">
          Our goal is to provide a simple, responsive,
          and user-friendly weather experience.
        </p>
      </div>
    </section>
  );
}
