import { type MetaDescriptor } from "react-router";

import ContainerWrap from "~/components/container/ContainerWrap";
import LazySshKeysPage from "~/features/sshKeys/LazySshKeysPage";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["SSH Keys", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function SshKeysPage() {
  return (
    <ContainerWrap>
      <LazySshKeysPage />
    </ContainerWrap>
  );
}
