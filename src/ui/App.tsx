import { useEffect, useMemo, useState } from "react";
import { useStatistics } from "./useStatistics";
import { Chart } from "./Chart";

function App() {
  const staticData = useStaticData();

  const [activeView, setActiveView] = useState<View>("CPU");
  const statistics = useStatistics(10);

  const cpuUsages = useMemo(
    () => statistics.map((stat) => stat.cpuUsage),
    [statistics],
  );
  const ramUsages = useMemo(
    () => statistics.map((stat) => stat.ramUsage),
    [statistics],
  );
  const storageUsages = useMemo(
    () => statistics.map((stat) => stat.storageUsage),
    [statistics],
  );

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case "CPU":
        return cpuUsages;
      case "RAM":
        return ramUsages;
      case "STORAGE":
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  useEffect(() => {
    return window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <div className="bg-neutral-900 w-full h-screen flex">
      {/* <Header /> */}
      <div className="w-1/3 border-r border-r-neutral-800 flex flex-col justify-center gap-6 px-6">
        <SelectOption
          onClick={() => setActiveView("CPU")}
          title="CPU"
          view="CPU"
          subTitle={staticData?.cpuModel ?? ""}
          data={cpuUsages}
        />
        <SelectOption
          onClick={() => setActiveView("RAM")}
          title="RAM"
          view="RAM"
          subTitle={(staticData?.totalMemoryGB.toString() ?? "") + " GB"}
          data={ramUsages}
        />
        <SelectOption
          onClick={() => setActiveView("STORAGE")}
          title="STORAGE"
          view="STORAGE"
          subTitle={(staticData?.totalStorage.toString() ?? "") + " GB"}
          data={storageUsages}
        />
      </div>
      <div className="w-2/3 h-full flex justify-center flex-col gap-2 px-6">
        <div className="w-full h-96">
          <Chart
            selectedView={activeView}
            data={activeUsages}
            maxDataPoints={10}
          />
        </div>
        <p
          className={`font-bold text-6xl ${
            activeView === "CPU"
              ? "text-blue-300"
              : activeView === "RAM"
                ? "text-orange-300"
                : "text-green-300"
          }`}
        >
          {activeView === "CPU"
            ? "CPU"
            : activeView === "RAM"
              ? "RAM"
              : "STORAGE"}
        </p>
      </div>
    </div>
  );
}

function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string;
  data: number[];
  onClick: () => void;
}) {
  return (
    <button className="rounded-xl w-full border border-neutral-800 p-4 hover:bg-neutral-800 transition-all duration-300 cursor-pointer" onClick={props.onClick}>
      <div className="text-neutral-300 text-left">
        <p>{props.title}</p>
        <p>{props.subTitle}</p>
      </div>
      <div className="w-full h-10">
        <Chart selectedView={props.view} data={props.data} maxDataPoints={10} />
      </div>
    </button>
  );
}

function Header() {
  return (
    <header className="">
      <button
        id="close"
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      />
      <button
        id="minimize"
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      />
      <button
        id="maximize"
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      />
    </header>
  );
}

function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData());
    })();
  }, []);

  return staticData;
}

export default App;
