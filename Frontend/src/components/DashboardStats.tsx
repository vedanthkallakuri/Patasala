import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import axios from "axios";
import TableHeader from "./TableHeader";
import AddRow from "./AddRow";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import dayjs from "dayjs";

import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { blueberryTwilightPalette, mangoFusionPalette, cheerfulFiestaPalette } from "@mui/x-charts/colorPalettes";

export default function DashboardStats({ authUserId }) {
  axios.defaults.withCredentials = true;

  const [dashboardStats, setDashboardStats] = useState({
    song_count: null,
    raga_count: null,
    tala_count: null,
    composer_count: null,
  });

  const [dashboardStatsGrowth, setDashboardStatsGrowth] = useState<any>([
    {
      growth: 0,
      songs: "",
    },
    {
      growth: 0,
      songs: "",
    },
    {
      growth: 0,
      songs: "",
    },
    {
      growth: 0,
      songs: "",
    },
  ]);

  const [dashboardLinechart, setDashboardLinechart] = useState<any>([
    {
      count: null,
      date_learned: "",
    },
  ]);

  const [dashboardPiechart, setDashboardPiechart] = useState<any>([
    {
      id: null,
      value: "",
      label: "",
    },
  ]);

  const [dates, setDates] = useState<any>([]);
  const [songCountPerDate, setSongCountPerDate] = useState<any>([]);
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/dashboard-stats", {
          params: {
            student_id: authUserId,
          },
        });
        setDashboardStats(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchDashboardStatsGrowth = async () => {
      try {
        const res = await axios.get("http://localhost:3000/dashboard-stats-growth", {
          params: {
            student_id: authUserId,
          },
        });
        setDashboardStatsGrowth(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchDashobardLinechart = async () => {
      try {
        const res = await axios.get("http://localhost:3000/dashboard-linechart", {
          params: {
            student_id: authUserId,
          },
        });
        setDashboardLinechart(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchDashboardPiechart = async () => {
      try {
        const res = await axios.get("http://localhost:3000/dashboard-piechart", {
          params: {
            student_id: authUserId,
          },
        });
        setDashboardPiechart(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchSongs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/songs", {
          params: { student_id: authUserId },
        });
        setSongs(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDashboardStats();
    fetchDashboardStatsGrowth();
    fetchDashobardLinechart();
    fetchDashboardPiechart();
    fetchSongs();
  }, [authUserId]);

  useEffect(() => {
    const formatDate = () => {
      setDates(
        ([] = dashboardLinechart.map((dashboardLinechart) => {
          var date = "";
          if (dashboardLinechart.date_learned !== null) {
            date = dashboardLinechart.date_learned!.split("T");
          }
          return new Date(date);
        }))
      );
      setSongCountPerDate(
        dashboardLinechart.map((dashboardLinechart) => {
          return dashboardLinechart.count;
        })
      );
    };
    console.log(dashboardStatsGrowth);

    formatDate();
  }, [dashboardLinechart]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      type: "string",
      width: 150,
      editable: false,
    },
    {
      field: "raga_name",
      headerName: "Raga",
      type: "string",
      width: 150,
      editable: false,
    },
    {
      field: "tala_name",
      headerName: "Tala",
      type: "string",
      width: 150,
      editable: false,
    },
    { field: "lyricist", headerName: "Lyricist", width: 150, editable: false },
    { field: "composer", headerName: "Composer", width: 150, editable: false },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-grid-row">
            <div className="dashboard-grid-cell-stats">
              <div className="dashboard-stats-row">
                <div className="dashboard-stats-cell">
                  <div className="dashboard-stats-cell-header">Songs</div>
                  <div className="dashboard-stats-cell-value">
                    {dashboardStats[0] && dashboardStats[0].song_count !== 0 ? dashboardStats[0].song_count : "--"}
                  </div>
                  <div className="dashboard-stats-cell-percentage">
                    {dashboardStatsGrowth[0].growth >= 0
                      ? "+" + dashboardStatsGrowth[0].growth + " "
                      : dashboardStatsGrowth[0].growth + " "}
                    in last month
                  </div>
                </div>
                <div className="dashboard-stats-cell">
                  {" "}
                  <div className="dashboard-stats-cell-header">Ragas</div>
                  <div className="dashboard-stats-cell-value">
                    {dashboardStats[0] && dashboardStats[0].raga_count !== 0 ? dashboardStats[0].raga_count : "--"}
                  </div>
                  <div className="dashboard-stats-cell-percentage">
                    {dashboardStatsGrowth[1].growth >= 0
                      ? "+" + dashboardStatsGrowth[1].growth + " "
                      : dashboardStatsGrowth[1].growth + " "}
                    in last month
                  </div>
                </div>
              </div>
              <div className="dashboard-stats-row">
                <div className="dashboard-stats-cell">
                  {" "}
                  <div className="dashboard-stats-cell-header">Talas</div>
                  <div className="dashboard-stats-cell-value">
                    {dashboardStats[0] && dashboardStats[0].tala_count !== 0 ? dashboardStats[0].tala_count : "--"}
                  </div>
                  <div className="dashboard-stats-cell-percentage">
                    {" "}
                    {dashboardStatsGrowth[2].growth >= 0
                      ? "+" + dashboardStatsGrowth[2].growth + " "
                      : dashboardStatsGrowth[2].growth + " "}
                    in last month
                  </div>
                </div>
                <div className="dashboard-stats-cell">
                  {" "}
                  <div className="dashboard-stats-cell-header">Composers</div>
                  <div className="dashboard-stats-cell-value">
                    {dashboardStats[0] && dashboardStats[0].composer_count !== 0
                      ? dashboardStats[0].composer_count
                      : "--"}
                  </div>
                  <div className="dashboard-stats-cell-percentage">
                    {dashboardStatsGrowth[3].growth >= 0
                      ? "+" + dashboardStatsGrowth[3].growth + " "
                      : dashboardStatsGrowth[3].growth + " "}
                    in last month
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-grid-cell-linegraph">
              <div className="linechart-header">Songs Learnt In The Past Month</div>
              <div className="linechart">
                <LineChart
                  xAxis={[
                    {
                      label: "Date",
                      data: dates,
                      tickInterval: dates,
                      scaleType: "time",
                      valueFormatter: (date) => dayjs(date).format("MMM D"),
                    },
                  ]}
                  yAxis={[{ label: "Number of Songs" }]}
                  series={[
                    {
                      data: songCountPerDate,
                      color: "#305090",
                      area: true,
                    },
                  ]}
                  width={600}
                  height={260}
                />
              </div>
            </div>
          </div>
          <div className="dashboard-grid-row">
            <div className="dashboard-grid-cell-grid">
              <DataGrid
                sx={{ fontFamily: "Poppins", p: "5px 5px" }}
                autoPageSize
                pagination
                rows={songs}
                columns={columns}
              />
            </div>
            <div className="dashboard-grid-cell-piechart">
              <div className="piechart-header">Raga Distribution</div>
              <div className="piechart">
                <PieChart
                  colors={cheerfulFiestaPalette}
                  series={[
                    {
                      data: dashboardPiechart,
                      innerRadius: 30,
                      outerRadius: 100,
                      paddingAngle: 5,
                      cornerRadius: 5,
                      startAngle: -180,
                      endAngle: 180,
                      cx: 150,
                      cy: 150,
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                    },
                  ]}
                  width={400}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
