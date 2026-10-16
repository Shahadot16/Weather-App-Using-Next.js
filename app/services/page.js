
const services = [
  {
    title: "Temperature",
    description: "Check the current temperature in your city in Celsius.",
    icon: "🌡️",
  },
  {
    title: "Hourly Forecast",
    description: "Explore hourly weather updates and temperature changes.",
    icon: "🕒",
  },
  {
    title: "Humidity",
    description: "Check the current humidity level in percentage.",
    icon: "💧",
  },
  {
    title: "Wind Speed",
    description: "Find out how fast the wind is blowing in your area.",
    icon: "💨",
  },
];

export default function Services() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Page Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          Our Services
        </h1>

        <p className="mt-3 text-gray-600">
          Explore the weather information available in our app.
        </p>
      </div>

      {/* Service Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div
            key={service.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-4xl">{service.icon}</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              {service.title}
            </h2>

            <p className="mt-3 leading-6 text-gray-600">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-12 rounded-2xl bg-blue-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-700">
          Weather Updates Made Easy
        </h2>

        <p className="mt-3 leading-7 text-gray-600">
          Our Weather App helps you understand weather conditions
          and plan your day with useful weather information.
        </p>
      </div>
    </section>
  );
}
