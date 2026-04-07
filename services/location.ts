export const getCountries = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/odata/v4/location/getCountries()`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const json = await res.json();
  return json.value || json;
};

export const getStatesByCountry = async (countryId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/odata/v4/location/getStatesByCountry(countryId='${countryId}')`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const json = await res.json();
  return json.value || json;
};
