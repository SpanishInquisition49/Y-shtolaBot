import axios from "axios";

export async function getCharacterIDFromLodestone(
    name: string,
    server: string
  ): Promise<string> {
    const url = `https://xivapi.com/character/search?name=${name}&server=${server}`;
    const response = await axios({
      method: "get",
      url: url,
      responseType: "json",
    });
    return response.data["ID"];
  }