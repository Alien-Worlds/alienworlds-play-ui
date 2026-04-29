import { Flex, Text, UnorderedList, ListItem, Link } from '@chakra-ui/react'
import ScrollContainer from 'react-indiana-drag-scroll'
import { Colors } from 'shared/util/colors'

export const CouncilCandidateNotice = () => {
  return (
    <Flex
      p={4}
      h="510px"
      mt="10px"
      borderWidth={2}
      direction="column"
      borderRadius="3xl"
      borderColor={Colors.SNOW_WHITE}
    >
      <ScrollContainer className="scroll-container" vertical hideScrollbars={false}>
        <Text fontSize="2xl" fontWeight={600}>
          IMPORTANT NOTICE (Council Candidate Notice)
        </Text>
        <Text>By executing this action</Text>
        <UnorderedList>
          <ListItem>
            You are making yourself available as a candidate for the planetary council (the
            “Planetary Council”), which is the executive body of a decentralized autonomous
            organization that constitutes a planet (as referenced above on this screen) within Alien
            Worlds <sup>TM</sup> (the “Planetary DAO”);
          </ListItem>
          <ListItem>
            you acknowledge and agree with the Candidate Terms and Notices, as reflected in section
            A below (which shall apply in addition to, but not limit the effect of, any terms of use
            you may already have entered into or otherwise acceded to);
          </ListItem>
          <ListItem>
            you acknowledge and agree that any activity of the Planetary Council shall at all times
            comply with the Planetary DAO Council Policy (the “Council Policy”), as reflected in
            section B below and as updated or amended by Dacoco from time to time, and you undertake
            to observe and fully comply with such Council Policy at any time that you are a member
            of the Planetary Council and/or otherwise hold any function within the Planetary DAO, in
            particular, without limitation, as a DAO Agent (as defined in the Council Policy);
          </ListItem>
          <ListItem>
            you restate your acceptance and approval of the Terms of Use of Alien Worlds
            <sup>TM</sup> (the “ToU”) as updated or amended by Dacoco from time to time and in
            particular, without limiting the generality of the foregoing, you reaffirm that you have
            acknowledged and accepted its section 11.2, as reproduced in section C below and as
            updated or amended by Dacoco from time to time, with regard to any data you submit,
            input or otherwise provide or share as a candidate to or member of the Planetary Council
            (or with regard to any other function within the Planetary DAO) in view of the immutable
            and permanent nature of data on the blockchain.
          </ListItem>
        </UnorderedList>
        <Text fontSize="2xl" fontWeight={600}>
          SECTION A - Candidate Terms and Notices
        </Text>
        <Text>
          The Planetary DAOs are an autonomous organizations. You hereby acknowledge and agree that
          any affiliation between yourself and a Planetary DAO, and in particular your membership
          therein, and your candidacy and potential appointment to any of its bodies, WILL NOT
          create, and shall not otherwise be deemed to constitute the basis of, an association
          between Dacoco and yourself and/or Dacoco and such Planetary DAO, subject only to your
          foregoing undertaking to observe and comply with the Alien Worlds <sup>TM</sup> Terms of
          Use, as amended from time to time (the “ToU””) and the Council Policy.
        </Text>
        <Text>
          You further acknowledge and agree that you will be solely responsible, and may become,
          either severally or jointly with others, personally liable with regard to, any actions or
          omissions associated with your candidacy to or mandate on a Planetary Council, in addition
          to any liability you may incur as a member of the relevant Planetary DAO. You are
          encouraged to independently, carefully and diligently review, consider and assess any
          potential implications, and where needed, to solicit such independent advice as may be
          required, before you decide to proceed with your candidature to the Planetary Council.
        </Text>
        <Text>
          Subject only to its right to update the Council Policy and the ToU from time to time, as
          it may deem necessary or otherwise appropriate or useful within its sole discretion,
          Dacoco does not, and does not intend to, exercise any control over any Planetary DAO’s
          activities or governance, nor does Dacoco assume any responsibility or liability in
          connection therewith. In particular, without limitation, Dacoco has no obligation and/or
          intention to:
        </Text>
        <UnorderedList>
          <ListItem>
            provide any guidance or instructions with regard to the function, duties and/or
            activities of any Planetary DAO and/or their Council; actively and regularly monitor, or
            to restrict or sanction any such functions, duties and/or activities;
          </ListItem>
          <ListItem>
            prevent, ascertain, assess, limit and/or remedy any risks or damages in connection with
            any such functions, duties and/or activities;
          </ListItem>
          <ListItem>
            and/or accept and investigate complaints with regard to the foregoing.
          </ListItem>
          <ListItem>
            {' '}
            However, and without limitation to the generality of the foregoing, Dacoco reserves the
            right to adopt the Restrictive Measures set out below with regard to a particular
            Planetary DAO, if it deems, within its sole discretion, that the activities of a
            Planetary DAO, and/or the functions, duties and/or activities of its Planetary Council
            and/or any of its DAO Agents are or may reasonably be expected to be:
          </ListItem>
          <UnorderedList>
            <ListItem>
              in breach of applicable laws and regulations and/or a cause for regulatory or other
              action by competent authorities;
            </ListItem>
            <ListItem>infringing on the intellectual property of a third party;</ListItem>
            <ListItem>
              deceptive, obscene, racist, excessively brutal, otherwise harmful and/or disparaging;
              and/or
            </ListItem>
            <ListItem>
              otherwise harmful to the reputation and/or legal or regulatory position of Dacoco
              and/or Alien Worlds <sup>TM</sup>
            </ListItem>
          </UnorderedList>
        </UnorderedList>

        <Text>
          In line with the foregoing, Dacoco has the right, but not the obligation, whether
          permanently or temporarily, to remove any Planetary DAO from receiving any Daily Trillium
          Allocation to Planets as described in the Alien Worlds<sup>TM</sup> Technical Blueprint or
          to implement any other available sanction or measure, if, within its sole discretion, it
          deems such sanction or measure (each a “Restrictive Measure”, collectively the
          “Restrictive Measures”) necessary or appropriate.
        </Text>
        <Text>
          This notice supplements, and does not supersede or limit the scope of the Council Policy
          and the ToU, each as amended from time to time.
        </Text>
        <Text fontSize="2xl" fontWeight={600}>
          SECTION B - Council Policy
        </Text>

        <Text fontSize="2xl" fontWeight={600}>
          Alien Worlds<span>&trade;</span> Planetary Council Policy
        </Text>
        <Text fontSize="xl" fontWeight={600}>
          v.1.6 - September 2024
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          1. The Planetary DAOs
        </Text>
        <Text>
          The Alien Worlds <sup>TM</sup> Metaverse consists of six individual planets (Veles, Naron,
          Kavian, Eyeke, Magor, and Neri, each a “Planet”). Each Planet is organized as two
          decentralized autonomous organizations (a “Syndicate DAO” and a “Union DAO”, each a
          “Planetary DAO”) consisting of all the players who have staked Trillium to such Planetary
          DAOs (each a “Planetary DAO Member”). Without limiting the generality of section 6 below,
          the action(s) of becoming a Planetary DAO Member and the affiliation thereby created
          between a member and the relevant Planetary DAO are subject to the the ToU and remain, at
          all times, within the sole responsibility of the relevant player/Planetary DAO Member.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          2. Available Trillium
        </Text>
        <Text>
          As part of the game mechanics of Alien Worlds <sup>TM</sup>, each Planetary DAO receives a
          daily allocation out of the Daily Trillium Allocation to Planets, which is available to it
          (with certain restrictions, as instituted from time to time by or upon direction of Dacoco
          GmbH, in its sole discretion) in order to develop its very own gaming landscape within the
          Alien Worlds <sup>TM</sup> Metaverse (the “Available Trillium”).
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          3. The Planetary Council
        </Text>
        <Text>
          Each Planet is organized as two decentralized autonomous organizations, each of which is
          governed by a distinct planetary council, one council for the Syndicate DAO, and one
          council for the Union DAO. Each council is composed of five members which are elected
          every seven days by the Planetary DAO Members (voting in function or the amounts of
          Trillium staked; each such council a “Planetary Council”). Any candidacy to a Planetary
          Council of a Planet is subject to the prior acceptance and subsequent observance of this
          Policy.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          4. Subordinate Bodies and Agents
        </Text>
        <Text>
          Subject to the self governance of the relevant Planetary DAO, a Planetary Council may
          appoint subordinate bodies, agents and/or representatives (“DAO Agents”) and delegate
          certain tasks and/or powers to such DAO Agents. No such DAO Agents shall be appointed and
          no tasks and/or powers shall be delegated to any such DAO Agents unless the relevant DAO
          Agent has first acceded to and accepted to comply with, for as long as they hold any
          powers for the relevant Planetary DAO and within the limits of the relevant delegation,
          the obligations and restrictions placed on the Planetary Council under this Policy.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          5. Purpose of the Planetary Council
        </Text>
        <Text>
          The purpose of each Planetary Council is to govern the relevant Planetary DAOs and
          administer its Available Trillium (or any other asset of the relevant Planetary DAO) to
          design, create, implement, maintain and develop an entertaining, engaging, player governed
          and publicly accessible gaming landscape that allows each Planetary DAO Member to enjoy
          the Alien Worlds <sup>TM</sup> Metaverse and its storytelling elements.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          6. Boundaries on the Planetary Council’s powers
        </Text>
        <Text>
          The Planetary Councils have great freedom in pursuing the purpose expressed above.
          However, its actions and initiatives in doing so must always adhere to the purpose,
          maintain the general character of Alien Worlds <sup>TM</sup> as an engaging gaming
          environment accessible to the general public, and shall, in particular, observe the
          following boundaries (“Excluded Actions”):
        </Text>
        <UnorderedList>
          <ListItem>
            No Gambling: A Planetary Council shall at all times refrain from instituting or
            otherwise implementing gaming mechanics in which players place a wager in view of a
            potential financial gain, whether such gain is dependent on chance, skill or otherwise;
          </ListItem>
          <ListItem>
            No Investments: Staking Trillium to a Planetary DAO does not and shall under no
            circumstance constitute an investment transaction. Staking actions shall not be executed
            with the expectation or otherwise in view of a return. For the avoidance of doubt and
            without limiting the generality of the foregoing, any action or omission of the
            Planetary Council (or any of its members) which would result in providing or otherwise
            availing Planetary DAO Members with a return on their staked Trillium, whether directly
            or indirectly, shall constitute an Excluded Action.
          </ListItem>
          <ListItem>
            No loans/no debt: The Planetary Council shall at no time enter into any loans, whether
            as lender or borrower, on behalf of the Planetary DAO, and shall in particular refrain
            from any action or omission which would result in a loan of Available Trillium or any
            other asset of the Planetary DAO to a borrower, whether secured or unsecured and whether
            for free or against consideration (e.g. interest).
          </ListItem>
          <ListItem>
            No financial intermediation; AML/CTF: The Planetary Council shall at all times refrain
            from negotiating or otherwise engaging into any transaction which would result in the
            Planetary DAO qualifying as a financial intermediary (or any similar concept) under
            applicable laws and regulations, and shall neither accept nor effect any transfers of
            value from or to any third parties without first ensuring such transactions can and will
            be made in compliance with any and all applicable laws and regulations, in particular,
            without limitation, any and all applicable anti money laundering and/or counter
            terrorism financing statutes, laws and regulations.
          </ListItem>
          <ListItem>
            No discrimination: The Planetary Council shall at all times refrain from instituting or
            otherwise implementing gaming mechanics, and/or from engaging in any other actions,
            which must reasonably be expected to limit the access of or which are otherwise
            discriminatory to certain players, for reasons other than those mandated by applicable
            laws and regulations (e.g. statutory age restrictions; limitations to certain
            jurisdictions under applicable gambling laws, etc.); Alien Worlds <sup>TM</sup>; games,
            which includes any games and other features instituted or otherwise implemented by a
            Planetary Council shall be accessible to the public, subject only to limitations
            mandated by applicable legal and regulatory requirements.
          </ListItem>
          <ListItem>
            No harmful actions: The Planetary Council shall at all times refrain from instituting or
            otherwise implementing gaming mechanics, and/or from engaging in any other actions,
            which must reasonably be expected to be perceived as unlawful, deceptive, obscene,
            racist, otherwise harmful or disparaging.
          </ListItem>
          <ListItem>
            No Circumvention: The Planetary Council shall at all times refrain from instituting or
            otherwise implementing gaming mechanics, from appointing and/or delegating tasks and/or
            powers to DAO Agents and/or from engaging in any other actions, which would result in a
            circumvention of this Policy.
          </ListItem>
        </UnorderedList>
        <Text>
          In making themselves available as a candidate to a Planetary Council, each prospective
          Planetary Council member undertakes, for as long as they hold any role on such Planetary
          Council or otherwise within the relevant Planetary DAO, to:
        </Text>
        <UnorderedList>
          <ListItem>observe and comply with this Policy; </ListItem>
          <ListItem>
            refrain from effecting, contributing to, enticing, soliciting or otherwise facilitating
            any Excluded Action; and
          </ListItem>
          <ListItem>
            to procure that any other officer, representative and/or agent of the relevant Planetary
            DAO shall also refrain from effecting, contributing to, enticing, soliciting or
            otherwise facilitating any Excluded Action.
          </ListItem>
        </UnorderedList>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          7. Order of Precedence
        </Text>
        <Text>
          This Policy supplements and should be read along with the Terms of Use of Alien Worlds{' '}
          <sup>TM</sup>
          as updated from time to time; the “ToU”; available under:
          <Link
            isExternal
            color={Colors.DI_SERRIA}
            href="https://alienworlds.io/terms-and-conditions/"
          >
            alienworlds.io/terms-and-conditions/{' '}
          </Link>
          , its technical blueprint as updated from time to time; the “Technical Blueprint”;
          available under:
          <Link
            isExternal
            color={Colors.DI_SERRIA}
            href="https://alienworlds.io/alien-worlds-blockchain-technical-blueprint/"
          >
            alienworlds.io/alien-worlds-blockchain-technical-blueprint/
          </Link>
          , the Membership Terms and Notices, as entered into upon joining the relevant Planetary
          DAO and the Alien Worlds <sup>TM</sup> website (as updated from time to time; the
          “Website”; available under alienworlds.io). In the event of any inconsistency between this
          document and the ToU, the Technical Blueprint the Membership Terms and Notices and/or the
          Website, this Policy shall in principle prevail, always provided that it shall not limit
          the scope of (i) any restrictions on the use of Alien Worlds <sup>TM</sup> under the ToU
          and (ii) the limitations of liability, the indemnification provisions and the applicable
          law and jurisdiction provisions of the ToU.
        </Text>

        <Text>
          As a decentralized metaverse, Alien Worlds <sup>TM</sup> relies on certain mechanics and
          powers instituted and governed by each Planetary DAO, as in force from time to time (“DAO
          Governance”). This Policy shall, in any event, prevail over the terms and/or effects of
          any DAO Governance and no DAO Governance shall be enacted or otherwise effected by a
          Planetary Council if such action would result in a contradiction or otherwise in an
          inconsistency between the relevant DAO Governance and this Policy.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          8. Terminology
        </Text>
        <Text>
          In materials other than the ToU and the Alien Worlds <sup>TM</sup> policies released by
          Dacoco (such other materials, e.g. marketing materials, other communications or materials
          released by third parties which may or may not be related to Dacoco, the “Other
          Materials”), certain features and actions of Alien Worlds <sup>TM</sup> may be referred to
          using terminology which deviates from the terminology used in this Policy.
        </Text>
        <Text>
          Among other terms, the term “syndicate” or “union” may be used to designate a Planetary
          DAO and the term “pledging” may be used to designate the action and/or the of staking.
        </Text>
        <Text>
          For the avoidance of doubt, this Policy shall apply to the concepts it addresses
          regardless of the terminology used by Other Materials to describe or refer to them and the
          terms used in this Policy shall be deemed to include any and all alternative terms used by
          Dacoco and/or its affiliates to describe the same actions, functions, features, effects or
          concepts of the game.
        </Text>
        <Text>
          Terms used by Dacoco and/or its affiliates in Other Materials to describe or refer to
          Alien Worlds <sup>TM</sup> actions, functions, features, effects or concepts are used
          solely for such purpose, irrespective of any other meaning or significance ascribed to
          them, whether generally or within a specific context. No meaning or effect, whether legal
          or otherwise, shall be inferred or derived from the use of a specific term in Other
          Materials to refer to a specific action, function, feature, effect or concept of Alien
          Worlds <sup>TM</sup> unless the ToU or the relevant policy released by Dacoco (including,
          without limitation, this policy) ascribe such meaning or effect to the relevant term. In
          particular, without limiting the generality of the foregoing:
        </Text>
        <UnorderedList>
          <ListItem>
            the use of the terms “syndicate” and “union” shall not be construed to imply any
            contractual relationship among the members of the relevant Planetary DAO, other than
            explicitly instituted through DAO Governance; and
          </ListItem>
          <ListItem>
            the use of the term “pledging” to designate the action of staking within Alien Worlds{' '}
            <sup>TM</sup>
            shall not be understood to imply the constitution, provision of or the entry into any
            guarantee, surety, assumption of liability or any other transaction of similar nature or
            effect.
          </ListItem>
        </UnorderedList>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          9. Language
        </Text>
        <Text>
          This policy may be translated into various other languages than English as part of its
          distribution. Any such translation is for convenience only and shall have no legal effect.
          Only the English language version, as in force from time to time, shall be authoritative
          and shall prevail over any other version in the event of inconsistencies.
        </Text>
        <Text alignSelf="flex-start" fontSize="lg" fontWeight={600}>
          10. Term, Alterations and Amendments
        </Text>
        <Text>
          This policy shall come into effect on September 25th, 2024, shall superseded any prior
          version hereof and remain valid until amended, altered or terminated by Dacoco GmbH (which
          shall be at liberty to do so at any time, within its sole discretion), provided that any
          such amendment, alteration or termination shall be published on the Website in a similar
          manner as this Policy (not including updates to any links thereto).
        </Text>
        <Text fontSize="2xl" fontWeight={700}>
          SECTION C - Section 11.2 of the T&C
        </Text>
        <Text alignSelf="flex-start" fontSize="xl" fontWeight={700}>
          11.2 Specific Acknowledgements and Consents with Regard to Data on the Blockchain
        </Text>
        <Text>
          Alien Worlds<sup>TM</sup> relies on various blockchain protocols for certain of its
          features, functions and actions, which include, without limitation, the WAX blockchain,
          the BSC blockchain and the Ethereum blockchain. Through your participation in Alien Worlds{' '}
          <sup>TM</sup>, you acknowledge and accept (i) that certain data, which may include
          personal data, is recorded on and irrevocably and permanently stored on the relevant
          blockchains, which are not controlled by Dacoco, (ii) that by virtue of its processing and
          storage on blockchain, any such data is and will irrevocably and permanently remain freely
          accessible to the public; and (iii) that enabling the relevant features, functions and the
          ability to perform actions represents, permanently and irrespective of any specific
          consent, a legitimate interest to process and store, and to make the relevant data
          available to the public on a blockchain (taking into account the immutable and permanent
          nature of such processing, storage and availability).
        </Text>
        <Text>
          You acknowledge and agree that the foregoing applies in particular, without limitation, to
          the following data:
        </Text>
        <UnorderedList>
          <ListItem>
            Data identifying your account and wallet, when playing the game, staking digital assets
            and/or calling actions on an Alien Worlds <sup>TM</sup> smart contract; and
          </ListItem>
          <ListItem>
            Individual data you submit or otherwise provide through the Alien Worlds <sup>TM</sup>{' '}
            user interface and/or Website with regard to your participation in Alien Worlds{' '}
            <sup>TM</sup>, such as e.g., user names, images, bio information or other data you
            submit in connection with your participation in a Planetary DAO, your candidacy for the
            Planetary Council of a Planetary DAO or any other proposal submitted in the context of a
            Planetary DAO.
          </ListItem>
        </UnorderedList>
        <Text>
          In calling any blockchain actions or in otherwise submitting any data through Alien Worlds{' '}
          <sup>TM</sup>, in particular, but not limited to, in submitting or providing data as
          described above, (x) you consent to such data being processed, stored and made available
          as described in the foregoing, (y) independently therefrom and in addition thereto, you
          confirm your acknowledgement and acceptance with regard to the aforementioned legitimate
          interest in respect of such data being processed, stored and made available irrevocably
          and permanently; and (z) you waive any right to be forgotten in respect of such data as
          well as any right to withdraw your consent under (x) above (in contemplation of the
          immutable and permanent nature of its processing, storage and availability on one or
          several blockchains).
        </Text>
      </ScrollContainer>
    </Flex>
  )
}
